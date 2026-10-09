"use client";

import * as React from "react";
import {
  Briefcase,
  Check,
  GraduationCap,
  Layers,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  User,
  Wrench,
  X,
} from "lucide-react";
import { HexButton } from "@/components/hex/hex-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SortableListItem } from "@/components/admin/sortable-list-item";
import { HexPhotoPreview } from "@/components/admin/hex-photo-preview";
import { MediaPicker, type MediaAsset } from "@/components/admin/media-picker";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";
import {
  updateProfileAction,
  createSkillCategoryAction,
  updateSkillCategoryAction,
  deleteSkillCategoryAction,
  reorderSkillCategoriesAction,
  createSkillAction,
  updateSkillAction,
  deleteSkillAction,
  reorderSkillsAction,
  moveSkillToCategoryAction,
  togglePublishSkillAction,
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
  reorderExperienceAction,
  togglePublishExperienceAction,
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  reorderServicesAction,
  togglePublishServiceAction,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialsAction,
  togglePublishTestimonialAction,
} from "./actions";
import type { ProfileInput } from "@/lib/validators/profile";
import type { SkillCategoryInput, SkillInput } from "@/lib/validators/skills";
import type { ExperienceInput } from "@/lib/validators/experience";
import type { ServiceInput } from "@/lib/validators/services";
import type { TestimonialInput } from "@/lib/validators/testimonials";
import type { SkillCategoryWithSkills } from "@/lib/db/queries/skills";
import { cn } from "@/lib/utils";

interface AboutClientProps {
  initialProfile: ProfileInput;
  initialSkillCategories: SkillCategoryWithSkills[];
  initialExperience: Array<ExperienceInput & { id: number }>;
  initialServices: Array<ServiceInput & { id: number }>;
  initialTestimonials: Array<TestimonialInput & { id: number }>;
  mediaAssets: MediaAsset[];
}

export function AboutClient({
  initialProfile,
  initialSkillCategories,
  initialExperience,
  initialServices,
  initialTestimonials,
  mediaAssets,
}: AboutClientProps) {
  const [activeTab, setActiveTab] = React.useState("profile");

  // ==========================================
  // 1. PROFILE STATE
  // ==========================================
  const [profileData, setProfileData] = React.useState<ProfileInput>(initialProfile);
  const [profilePending, startProfileTransition] = React.useTransition();
  const [profileSuccess, setProfileSuccess] = React.useState(false);
  const [showProfileMediaPicker, setShowProfileMediaPicker] = React.useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    startProfileTransition(async () => {
      const res = await updateProfileAction(profileData);
      if (res.success) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    });
  };

  // ==========================================
  // 2. SKILLS & CATEGORIES STATE
  // ==========================================
  const [categories, setCategories] =
    React.useState<SkillCategoryWithSkills[]>(initialSkillCategories);
  const [skillsPending, startSkillsTransition] = React.useTransition();

  // Category Modal State
  const [catDialogOpen, setCatDialogOpen] = React.useState(false);
  const [editingCatId, setEditingCatId] = React.useState<number | null>(null);
  const [catForm, setCatForm] = React.useState<SkillCategoryInput>({
    name: "",
    icon: "Folder",
    order: 0,
    published: true,
  });

  // Skill Modal State
  const [skillDialogOpen, setSkillDialogOpen] = React.useState(false);
  const [editingSkillId, setEditingSkillId] = React.useState<number | null>(null);
  const [skillForm, setSkillForm] = React.useState<SkillInput>({
    categoryId: 0,
    name: "",
    icon: "Code2",
    tier: "primary",
    years: 1,
    order: 0,
    published: true,
  });

  // Drag-and-drop state for skills between categories
  const [draggedSkill, setDraggedSkill] = React.useState<{
    id: number;
    fromCategoryId: number;
  } | null>(null);

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    startSkillsTransition(async () => {
      if (editingCatId) {
        const res = await updateSkillCategoryAction(editingCatId, catForm);
        if (res.success) {
          setCategories(
            categories.map((c) =>
              c.id === editingCatId ? { ...c, ...catForm } : c
            )
          );
          setCatDialogOpen(false);
        }
      } else {
        const res = await createSkillCategoryAction({
          ...catForm,
          order: categories.length + 1,
        });
        if (res.success && res.category) {
          setCategories([
            ...categories,
            { ...res.category, skills: [] } as SkillCategoryWithSkills,
          ]);
          setCatDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteCategory = (id: number) => {
    startSkillsTransition(async () => {
      const res = await deleteSkillCategoryAction(id);
      if (res.success) {
        setCategories(categories.filter((c) => c.id !== id));
      }
    });
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    startSkillsTransition(async () => {
      if (editingSkillId) {
        const res = await updateSkillAction(editingSkillId, skillForm);
        if (res.success) {
          setCategories(
            categories.map((cat) => ({
              ...cat,
              skills: cat.skills
                .map((s) => (s.id === editingSkillId ? { ...s, ...skillForm } : s))
                .filter((s) => s.categoryId === cat.id),
            }))
          );
          setSkillDialogOpen(false);
        }
      } else {
        const targetCat = categories.find((c) => c.id === skillForm.categoryId);
        const order = (targetCat?.skills.length || 0) + 1;
        const res = await createSkillAction({ ...skillForm, order });
        if (res.success && res.skill) {
          setCategories(
            categories.map((cat) =>
              cat.id === skillForm.categoryId
                ? { ...cat, skills: [...cat.skills, res.skill] }
                : cat
            )
          );
          setSkillDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteSkill = (id: number) => {
    startSkillsTransition(async () => {
      const res = await deleteSkillAction(id);
      if (res.success) {
        setCategories(
          categories.map((cat) => ({
            ...cat,
            skills: cat.skills.filter((s) => s.id !== id),
          }))
        );
      }
    });
  };

  const handleMoveSkillToCategory = (
    skillId: number,
    fromCatId: number,
    toCatId: number
  ) => {
    if (fromCatId === toCatId) return;
    const fromCat = categories.find((c) => c.id === fromCatId);
    const skill = fromCat?.skills.find((s) => s.id === skillId);
    if (!skill) return;

    const targetCat = categories.find((c) => c.id === toCatId);
    const newOrder = (targetCat?.skills.length || 0) + 1;

    setCategories(
      categories.map((cat) => {
        if (cat.id === fromCatId) {
          return { ...cat, skills: cat.skills.filter((s) => s.id !== skillId) };
        }
        if (cat.id === toCatId) {
          return {
            ...cat,
            skills: [...cat.skills, { ...skill, categoryId: toCatId, order: newOrder }],
          };
        }
        return cat;
      })
    );

    startSkillsTransition(async () => {
      await moveSkillToCategoryAction(skillId, toCatId, newOrder);
    });
  };

  const handleTogglePublishSkill = (id: number, current: boolean) => {
    const next = !current;
    setCategories(
      categories.map((cat) => ({
        ...cat,
        skills: cat.skills.map((s) => (s.id === id ? { ...s, published: next } : s)),
      }))
    );
    startSkillsTransition(async () => {
      await togglePublishSkillAction(id, next);
    });
  };

  // ==========================================
  // 3. EXPERIENCE STATE
  // ==========================================
  const [expList, setExpList] =
    React.useState<Array<ExperienceInput & { id: number }>>(initialExperience);
  const [expPending, startExpTransition] = React.useTransition();
  const [expDialogOpen, setExpDialogOpen] = React.useState(false);
  const [editingExpId, setEditingExpId] = React.useState<number | null>(null);
  const [expForm, setExpForm] = React.useState<ExperienceInput>({
    role: "",
    org: "",
    dates: "",
    description: "",
    type: "work",
    order: 0,
    published: true,
  });

  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    startExpTransition(async () => {
      if (editingExpId) {
        const res = await updateExperienceAction(editingExpId, expForm);
        if (res.success) {
          setExpList(
            expList.map((item) =>
              item.id === editingExpId ? { ...item, ...expForm } : item
            )
          );
          setExpDialogOpen(false);
        }
      } else {
        const res = await createExperienceAction({
          ...expForm,
          order: expList.length + 1,
        });
        if (res.success && res.item) {
          setExpList([...expList, res.item as ExperienceInput & { id: number }]);
          setExpDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteExperience = (id: number) => {
    startExpTransition(async () => {
      const res = await deleteExperienceAction(id);
      if (res.success) {
        setExpList(expList.filter((e) => e.id !== id));
      }
    });
  };

  const handleMoveExperience = (from: number, to: number) => {
    if (to < 0 || to >= expList.length) return;
    const reordered = [...expList];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setExpList(reordered);
    startExpTransition(async () => {
      await reorderExperienceAction(reordered.map((e) => e.id));
    });
  };

  const handleTogglePublishExperience = (id: number, current: boolean) => {
    const next = !current;
    setExpList(
      expList.map((e) => (e.id === id ? { ...e, published: next } : e))
    );
    startExpTransition(async () => {
      await togglePublishExperienceAction(id, next);
    });
  };

  // ==========================================
  // 4. SERVICES STATE
  // ==========================================
  const [servicesList, setServicesList] =
    React.useState<Array<ServiceInput & { id: number }>>(initialServices);
  const [servicePending, startServiceTransition] = React.useTransition();
  const [serviceDialogOpen, setServiceDialogOpen] = React.useState(false);
  const [editingServiceId, setEditingServiceId] = React.useState<number | null>(null);
  const [serviceForm, setServiceForm] = React.useState<ServiceInput>({
    title: "",
    description: "",
    deliverables: [],
    priceFrom: "",
    timeline: "",
    icon: "Sparkles",
    order: 0,
    published: true,
  });
  const [deliverablesInput, setDeliverablesInput] = React.useState("");

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const deliverables = deliverablesInput
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);

    const data: ServiceInput = {
      ...serviceForm,
      deliverables: deliverables.length > 0 ? deliverables : serviceForm.deliverables,
    };

    startServiceTransition(async () => {
      if (editingServiceId) {
        const res = await updateServiceAction(editingServiceId, data);
        if (res.success) {
          setServicesList(
            servicesList.map((s) =>
              s.id === editingServiceId ? { ...s, ...data } : s
            )
          );
          setServiceDialogOpen(false);
        }
      } else {
        const res = await createServiceAction({
          ...data,
          order: servicesList.length + 1,
        });
        if (res.success && res.service) {
          setServicesList([
            ...servicesList,
            res.service as ServiceInput & { id: number },
          ]);
          setServiceDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteService = (id: number) => {
    startServiceTransition(async () => {
      const res = await deleteServiceAction(id);
      if (res.success) {
        setServicesList(servicesList.filter((s) => s.id !== id));
      }
    });
  };

  const handleMoveService = (from: number, to: number) => {
    if (to < 0 || to >= servicesList.length) return;
    const reordered = [...servicesList];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setServicesList(reordered);
    startServiceTransition(async () => {
      await reorderServicesAction(reordered.map((s) => s.id));
    });
  };

  const handleTogglePublishService = (id: number, current: boolean) => {
    const next = !current;
    setServicesList(
      servicesList.map((s) => (s.id === id ? { ...s, published: next } : s))
    );
    startServiceTransition(async () => {
      await togglePublishServiceAction(id, next);
    });
  };

  // ==========================================
  // 5. TESTIMONIALS STATE
  // ==========================================
  const [testimonialsList, setTestimonialsList] =
    React.useState<Array<TestimonialInput & { id: number }>>(initialTestimonials);
  const [testPending, startTestTransition] = React.useTransition();
  const [testDialogOpen, setTestDialogOpen] = React.useState(false);
  const [editingTestId, setEditingTestId] = React.useState<number | null>(null);
  const [testForm, setTestForm] = React.useState<TestimonialInput>({
    quote: "",
    name: "",
    role: "",
    photoUrl: null,
    projectId: null,
    order: 0,
    published: true,
  });
  const [showTestMediaPicker, setShowTestMediaPicker] = React.useState(false);

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    startTestTransition(async () => {
      if (editingTestId) {
        const res = await updateTestimonialAction(editingTestId, testForm);
        if (res.success) {
          setTestimonialsList(
            testimonialsList.map((t) =>
              t.id === editingTestId ? { ...t, ...testForm } : t
            )
          );
          setTestDialogOpen(false);
        }
      } else {
        const res = await createTestimonialAction({
          ...testForm,
          order: testimonialsList.length + 1,
        });
        if (res.success && res.testimonial) {
          setTestimonialsList([
            ...testimonialsList,
            res.testimonial as TestimonialInput & { id: number },
          ]);
          setTestDialogOpen(false);
        }
      }
    });
  };

  const handleDeleteTestimonial = (id: number) => {
    startTestTransition(async () => {
      const res = await deleteTestimonialAction(id);
      if (res.success) {
        setTestimonialsList(testimonialsList.filter((t) => t.id !== id));
      }
    });
  };

  const handleMoveTestimonial = (from: number, to: number) => {
    if (to < 0 || to >= testimonialsList.length) return;
    const reordered = [...testimonialsList];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setTestimonialsList(reordered);
    startTestTransition(async () => {
      await reorderTestimonialsAction(reordered.map((t) => t.id));
    });
  };

  const handleTogglePublishTestimonial = (id: number, current: boolean) => {
    const next = !current;
    setTestimonialsList(
      testimonialsList.map((t) => (t.id === id ? { ...t, published: next } : t))
    );
    startTestTransition(async () => {
      await togglePublishTestimonialAction(id, next);
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="skills">Skills & Hive</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* TAB 1: PROFILE                             */}
        {/* ========================================== */}
        <TabsContent value="profile" className="space-y-6 pt-4">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo & Hex Crop Preview */}
              <div className="border border-border bg-surface p-5 space-y-4 flex flex-col items-center">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground self-start">
                  Hex Profile Photo
                </span>

                <HexPhotoPreview
                  photoUrl={profileData.photoUrl}
                  zoom={profileData.photoCrops?.zoom ?? 1}
                  offsetX={profileData.photoCrops?.offsetX ?? 0}
                  offsetY={profileData.photoCrops?.offsetY ?? 0}
                  onCropChange={(crops) =>
                    setProfileData({ ...profileData, photoCrops: crops })
                  }
                />

                <div className="w-full space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={profileData.photoUrl}
                      onChange={(e) =>
                        setProfileData({ ...profileData, photoUrl: e.target.value })
                      }
                      placeholder="Image URL..."
                      className="text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfileMediaPicker(true)}
                      className="px-2.5 py-1.5 border border-border bg-background text-xs font-mono uppercase hover:border-primary transition-colors cursor-pointer"
                      title="Pick from Media Library"
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="md:col-span-2 border border-border bg-surface p-6 space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      Public Identity & Story
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono uppercase">
                      Name, geographic location, and biographical narratives
                    </p>
                  </div>
                  {profileSuccess && (
                    <span className="font-mono text-xs uppercase text-success flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Saved
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Display Name
                    </label>
                    <Input
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      placeholder="Lonnex Njenga"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Location
                      </label>
                      <Input
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                        placeholder="Nairobi, Kenya"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Timezone
                      </label>
                      <Input
                        value={profileData.timezone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            timezone: e.target.value,
                          })
                        }
                        placeholder="Africa/Nairobi (EAT, UTC+3)"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Short Bio (Hero / Intro)
                    </label>
                    <Textarea
                      value={profileData.shortBio}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          shortBio: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Web and mobile developer and graphic designer..."
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Long Bio (Full Narrative)
                    </label>
                    <Textarea
                      value={profileData.longBio}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          longBio: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Specialising in TypeScript, Next.js, Flutter..."
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-border">
                  <HexButton
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={profilePending}
                  >
                    {profilePending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 inline mr-1" />
                    )}
                    Save Profile
                  </HexButton>
                </div>
              </div>
            </div>
          </form>

          {/* Media Picker for Profile */}
          {showProfileMediaPicker && (
            <MediaPicker
              assets={mediaAssets}
              onSelect={(selected) => {
                if (selected.length > 0) {
                  setProfileData({
                    ...profileData,
                    photoUrl: resolveMediaUrl(selected[0].publicId, {
                      width: 600,
                      height: 600,
                    }),
                  });
                }
              }}
              onClose={() => setShowProfileMediaPicker(false)}
            />
          )}
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 2: SKILLS & HIVE                       */}
        {/* ========================================== */}
        <TabsContent value="skills" className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Skill Categories & Honeycomb Matrix
              </h3>
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Drag skills between categories or reorder within hives
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingCatId(null);
                  setCatForm({
                    name: "",
                    icon: "Folder",
                    order: categories.length + 1,
                    published: true,
                  });
                  setCatDialogOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Category
              </Button>
              <HexButton
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  if (categories.length === 0) return;
                  setEditingSkillId(null);
                  setSkillForm({
                    categoryId: categories[0].id,
                    name: "",
                    icon: "Code2",
                    tier: "primary",
                    years: 1,
                    order: 0,
                    published: true,
                  });
                  setSkillDialogOpen(true);
                }}
                disabled={categories.length === 0}
              >
                <Plus className="h-3.5 w-3.5 mr-1 inline" />
                Add Skill
              </HexButton>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center border border-border bg-background space-y-2">
              <Layers className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="font-mono text-xs uppercase text-muted-foreground">
                No skill categories created yet. Click "Add Category" above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedSkill && draggedSkill.fromCategoryId !== cat.id) {
                      handleMoveSkillToCategory(
                        draggedSkill.id,
                        draggedSkill.fromCategoryId,
                        cat.id
                      );
                      setDraggedSkill(null);
                    }
                  }}
                  className="border border-border bg-surface p-5 space-y-4"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {cat.name}
                      </span>
                      <span className="font-mono text-[10px] uppercase text-muted-foreground bg-background px-2 py-0.5 border border-border">
                        {cat.skills.length} skills
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSkillId(null);
                          setSkillForm({
                            categoryId: cat.id,
                            name: "",
                            icon: "Code2",
                            tier: "primary",
                            years: 1,
                            order: cat.skills.length + 1,
                            published: true,
                          });
                          setSkillDialogOpen(true);
                        }}
                        className="px-2 py-1 text-xs font-mono uppercase border border-border hover:border-primary transition-colors cursor-pointer"
                      >
                        + Add Skill
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setCatForm({
                            name: cat.name,
                            icon: cat.icon,
                            order: cat.order,
                            published: cat.published,
                          });
                          setCatDialogOpen(true);
                        }}
                        className="p-1 border border-border hover:border-primary transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 border border-border text-muted-foreground hover:text-danger hover:border-danger/40 transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Skills Grid within Category */}
                  {cat.skills.length === 0 ? (
                    <div className="p-4 border border-dashed border-border text-center bg-background/50 text-xs font-mono uppercase text-muted-foreground">
                      Drag skills here or click "+ Add Skill"
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {cat.skills.map((skill) => (
                        <div
                          key={skill.id}
                          draggable
                          onDragStart={() =>
                            setDraggedSkill({
                              id: skill.id,
                              fromCategoryId: cat.id,
                            })
                          }
                          className={cn(
                            "flex items-center justify-between p-3 border bg-background transition-all group cursor-grab active:cursor-grabbing",
                            skill.published
                              ? "border-border hover:border-primary"
                              : "border-border/60 opacity-60 line-through"
                          )}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-bold text-xs text-foreground block truncate">
                              {skill.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                              <span className="uppercase text-primary">
                                {skill.tier}
                              </span>
                              <span>·</span>
                              <span>{skill.years}y</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSkillId(skill.id);
                                setSkillForm({
                                  categoryId: skill.categoryId,
                                  name: skill.name,
                                  icon: skill.icon,
                                  tier: skill.tier as "primary" | "secondary" | "familiar",
                                  years: skill.years,
                                  order: skill.order,
                                  published: skill.published,
                                });
                                setSkillDialogOpen(true);
                              }}
                              className="p-1 border border-border hover:border-primary transition-colors cursor-pointer"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleTogglePublishSkill(skill.id, skill.published)
                              }
                              className="p-1 border border-border hover:border-primary transition-colors cursor-pointer text-[9px] font-mono"
                            >
                              {skill.published ? "Pub" : "Off"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="p-1 border border-border hover:text-danger hover:border-danger/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Category Dialog */}
          <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>
                  {editingCatId ? "Edit Category" : "New Skill Category"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Category Name
                  </label>
                  <Input
                    value={catForm.name}
                    onChange={(e) =>
                      setCatForm({ ...catForm, name: e.target.value })
                    }
                    placeholder="Web & Full-Stack"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Icon Name
                  </label>
                  <Input
                    value={catForm.icon}
                    onChange={(e) =>
                      setCatForm({ ...catForm, icon: e.target.value })
                    }
                    placeholder="Code2, Globe, Palette..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCatDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <HexButton
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={skillsPending}
                  >
                    Save Category
                  </HexButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Skill Dialog */}
          <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSkillId ? "Edit Skill" : "New Skill"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSaveSkill} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Parent Category
                  </label>
                  <Select
                    value={String(skillForm.categoryId)}
                    onChange={(e) =>
                      setSkillForm({
                        ...skillForm,
                        categoryId: parseInt(e.target.value, 10),
                      })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Skill Name
                  </label>
                  <Input
                    value={skillForm.name}
                    onChange={(e) =>
                      setSkillForm({ ...skillForm, name: e.target.value })
                    }
                    placeholder="Next.js & React"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Proficiency Tier
                    </label>
                    <Select
                      value={skillForm.tier}
                      onChange={(e) =>
                        setSkillForm({
                          ...skillForm,
                          tier: e.target.value as
                            | "primary"
                            | "secondary"
                            | "familiar",
                        })
                      }
                    >
                      <option value="primary">Core / Primary</option>
                      <option value="secondary">Strong / Secondary</option>
                      <option value="familiar">Familiar / Learning</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Years Experience
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={skillForm.years}
                      onChange={(e) =>
                        setSkillForm({
                          ...skillForm,
                          years: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Icon Name
                  </label>
                  <Input
                    value={skillForm.icon}
                    onChange={(e) =>
                      setSkillForm({ ...skillForm, icon: e.target.value })
                    }
                    placeholder="Code2, Database, PenTool..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSkillDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <HexButton
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={skillsPending}
                  >
                    Save Skill
                  </HexButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 3: EXPERIENCE                          */}
        {/* ========================================== */}
        <TabsContent value="experience" className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Experience & Education
              </h3>
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Work contracts, agency roles, and educational milestones
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setEditingExpId(null);
                setExpForm({
                  role: "",
                  org: "",
                  dates: "",
                  description: "",
                  type: "work",
                  order: expList.length + 1,
                  published: true,
                });
                setExpDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Experience
            </Button>
          </div>

          {expList.length === 0 ? (
            <div className="p-8 text-center border border-border bg-background space-y-2">
              <Briefcase className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="font-mono text-xs uppercase text-muted-foreground">
                No experience entries added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {expList.map((item, idx) => (
                <SortableListItem
                  key={item.id}
                  id={item.id}
                  index={idx}
                  total={expList.length}
                  isPublished={item.published}
                  onMoveUp={() => handleMoveExperience(idx, idx - 1)}
                  onMoveDown={() => handleMoveExperience(idx, idx + 1)}
                  onTogglePublished={() =>
                    handleTogglePublishExperience(item.id, item.published)
                  }
                  onEdit={() => {
                    setEditingExpId(item.id);
                    setExpForm({
                      role: item.role,
                      org: item.org,
                      dates: item.dates,
                      description: item.description,
                      type: item.type,
                      order: item.order,
                      published: item.published,
                    });
                    setExpDialogOpen(true);
                  }}
                  onDelete={() => handleDeleteExperience(item.id)}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {item.role}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        @ {item.org}
                      </span>
                      <span className="px-1.5 py-0.2 border border-border text-[9px] font-mono uppercase text-primary">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono text-[10px]">{item.dates}</span>
                      <span>·</span>
                      <span className="line-clamp-1">{item.description}</span>
                    </div>
                  </div>
                </SortableListItem>
              ))}
            </div>
          )}

          {/* Experience Dialog */}
          <Dialog open={expDialogOpen} onOpenChange={setExpDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExpId ? "Edit Experience" : "New Experience"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSaveExperience} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Role Title
                    </label>
                    <Input
                      value={expForm.role}
                      onChange={(e) =>
                        setExpForm({ ...expForm, role: e.target.value })
                      }
                      placeholder="Lead Web Developer"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Organization / Client
                    </label>
                    <Input
                      value={expForm.org}
                      onChange={(e) =>
                        setExpForm({ ...expForm, org: e.target.value })
                      }
                      placeholder="Acme Studio"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Dates / Timeframe
                    </label>
                    <Input
                      value={expForm.dates}
                      onChange={(e) =>
                        setExpForm({ ...expForm, dates: e.target.value })
                      }
                      placeholder="2023 — Present"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Entry Type
                    </label>
                    <Select
                      value={expForm.type}
                      onChange={(e) =>
                        setExpForm({
                          ...expForm,
                          type: e.target.value as "work" | "education",
                        })
                      }
                    >
                      <option value="work">Work Contract</option>
                      <option value="education">Education / Degree</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Description & Highlights
                  </label>
                  <Textarea
                    value={expForm.description}
                    onChange={(e) =>
                      setExpForm({ ...expForm, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Architected frontend systems, designed brand identities..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setExpDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <HexButton
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={expPending}
                  >
                    Save Entry
                  </HexButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 4: SERVICES                            */}
        {/* ========================================== */}
        <TabsContent value="services" className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Service Offerings & Packages
              </h3>
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Services with deliverables, turnaround timelines, and starting rates
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setEditingServiceId(null);
                setServiceForm({
                  title: "",
                  description: "",
                  deliverables: [],
                  priceFrom: "$500",
                  timeline: "1-2 weeks",
                  icon: "Sparkles",
                  order: servicesList.length + 1,
                  published: true,
                });
                setDeliverablesInput("");
                setServiceDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Service
            </Button>
          </div>

          {servicesList.length === 0 ? (
            <div className="p-8 text-center border border-border bg-background space-y-2">
              <Sparkles className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="font-mono text-xs uppercase text-muted-foreground">
                No services defined yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {servicesList.map((srv, idx) => (
                <SortableListItem
                  key={srv.id}
                  id={srv.id}
                  index={idx}
                  total={servicesList.length}
                  isPublished={srv.published}
                  onMoveUp={() => handleMoveService(idx, idx - 1)}
                  onMoveDown={() => handleMoveService(idx, idx + 1)}
                  onTogglePublished={() =>
                    handleTogglePublishService(srv.id, srv.published)
                  }
                  onEdit={() => {
                    setEditingServiceId(srv.id);
                    setServiceForm({
                      title: srv.title,
                      description: srv.description,
                      deliverables: srv.deliverables,
                      priceFrom: srv.priceFrom,
                      timeline: srv.timeline,
                      icon: srv.icon,
                      order: srv.order,
                      published: srv.published,
                    });
                    setDeliverablesInput(srv.deliverables.join("\n"));
                    setServiceDialogOpen(true);
                  }}
                  onDelete={() => handleDeleteService(srv.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {srv.title}
                      </span>
                      <span className="font-mono text-[10px] text-primary border border-border px-1.5 py-0.2">
                        {srv.priceFrom}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {srv.timeline}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {srv.description}
                    </p>
                  </div>
                </SortableListItem>
              ))}
            </div>
          )}

          {/* Service Dialog */}
          <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingServiceId ? "Edit Service" : "New Service Offering"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSaveService} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Service Title
                  </label>
                  <Input
                    value={serviceForm.title}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, title: e.target.value })
                    }
                    placeholder="Full-Stack Web Development"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Price From
                    </label>
                    <Input
                      value={serviceForm.priceFrom}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          priceFrom: e.target.value,
                        })
                      }
                      placeholder="$1,500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Timeline
                    </label>
                    <Input
                      value={serviceForm.timeline}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          timeline: e.target.value,
                        })
                      }
                      placeholder="2-4 weeks"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Deliverables (One per line)
                  </label>
                  <Textarea
                    value={deliverablesInput}
                    onChange={(e) => setDeliverablesInput(e.target.value)}
                    rows={3}
                    placeholder="Full application source&#10;Admin CMS&#10;Documentation"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setServiceDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <HexButton
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={servicePending}
                  >
                    Save Service
                  </HexButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 5: TESTIMONIALS                        */}
        {/* ========================================== */}
        <TabsContent value="testimonials" className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Client Testimonials & Quotes
              </h3>
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Endorsements from collaborators, clients, and partners
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                setEditingTestId(null);
                setTestForm({
                  quote: "",
                  name: "",
                  role: "",
                  photoUrl: null,
                  projectId: null,
                  order: testimonialsList.length + 1,
                  published: true,
                });
                setTestDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Testimonial
            </Button>
          </div>

          {testimonialsList.length === 0 ? (
            <div className="p-8 text-center border border-border bg-background space-y-2">
              <MessageSquareQuote className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="font-mono text-xs uppercase text-muted-foreground">
                No testimonials added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {testimonialsList.map((t, idx) => (
                <SortableListItem
                  key={t.id}
                  id={t.id}
                  index={idx}
                  total={testimonialsList.length}
                  isPublished={t.published}
                  onMoveUp={() => handleMoveTestimonial(idx, idx - 1)}
                  onMoveDown={() => handleMoveTestimonial(idx, idx + 1)}
                  onTogglePublished={() =>
                    handleTogglePublishTestimonial(t.id, t.published)
                  }
                  onEdit={() => {
                    setEditingTestId(t.id);
                    setTestForm({
                      quote: t.quote,
                      name: t.name,
                      role: t.role,
                      photoUrl: t.photoUrl,
                      projectId: t.projectId,
                      order: t.order,
                      published: t.published,
                    });
                    setTestDialogOpen(true);
                  }}
                  onDelete={() => handleDeleteTestimonial(t.id)}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {t.name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        ({t.role})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic line-clamp-1">
                      "{t.quote}"
                    </p>
                  </div>
                </SortableListItem>
              ))}
            </div>
          )}

          {/* Testimonial Dialog */}
          <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTestId ? "Edit Testimonial" : "New Testimonial"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSaveTestimonial} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Quote
                  </label>
                  <Textarea
                    value={testForm.quote}
                    onChange={(e) =>
                      setTestForm({ ...testForm, quote: e.target.value })
                    }
                    rows={3}
                    placeholder="Lonnex delivered a flawless architecture..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Client Name
                    </label>
                    <Input
                      value={testForm.name}
                      onChange={(e) =>
                        setTestForm({ ...testForm, name: e.target.value })
                      }
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">
                      Role / Company
                    </label>
                    <Input
                      value={testForm.role}
                      onChange={(e) =>
                        setTestForm({ ...testForm, role: e.target.value })
                      }
                      placeholder="CTO @ TechCorp"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-muted-foreground">
                    Photo URL (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={testForm.photoUrl || ""}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          photoUrl: e.target.value || null,
                        })
                      }
                      placeholder="Photo URL or Cloudinary asset"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTestMediaPicker(true)}
                      className="px-2.5 py-1 border border-border bg-background text-xs font-mono uppercase hover:border-primary transition-colors cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTestDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <HexButton
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={testPending}
                  >
                    Save Testimonial
                  </HexButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Media Picker for Testimonials */}
          {showTestMediaPicker && (
            <MediaPicker
              assets={mediaAssets}
              onSelect={(selected) => {
                if (selected.length > 0) {
                  setTestForm({
                    ...testForm,
                    photoUrl: resolveMediaUrl(selected[0].publicId, {
                      width: 400,
                      height: 400,
                    }),
                  });
                }
              }}
              onClose={() => setShowTestMediaPicker(false)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
