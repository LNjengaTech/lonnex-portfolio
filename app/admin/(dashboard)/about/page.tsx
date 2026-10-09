import { requireAuth } from "@/lib/auth";
import { getProfile } from "@/lib/db/queries/profile";
import { getSkillCategoriesWithSkills } from "@/lib/db/queries/skills";
import { getExperienceList } from "@/lib/db/queries/experience";
import { getServicesList } from "@/lib/db/queries/services";
import { getTestimonialsList } from "@/lib/db/queries/testimonials";
import { getAllMediaAssets } from "@/lib/db/queries/media";
import { AboutClient } from "./about-client";
import type { ProfileInput } from "@/lib/validators/profile";
import type { ExperienceInput } from "@/lib/validators/experience";
import type { ServiceInput } from "@/lib/validators/services";
import type { TestimonialInput } from "@/lib/validators/testimonials";

export default async function AdminAboutPage() {
  await requireAuth();

  const profileData = await getProfile();
  const skillCategories = await getSkillCategoriesWithSkills(true);
  const experienceList = await getExperienceList(true);
  const servicesList = await getServicesList(true);
  const testimonialsList = await getTestimonialsList(true);
  const mediaAssets = await getAllMediaAssets();

  const formattedProfile: ProfileInput = {
    name: profileData.name,
    shortBio: profileData.shortBio,
    longBio: profileData.longBio,
    photoUrl: profileData.photoUrl,
    photoCrops: profileData.photoCrops as ProfileInput["photoCrops"],
    location: profileData.location,
    timezone: profileData.timezone,
  };

  const formattedExperience: Array<ExperienceInput & { id: number }> =
    experienceList.map((e) => ({
      id: e.id,
      role: e.role,
      org: e.org,
      dates: e.dates,
      description: e.description,
      type: e.type as "work" | "education",
      order: e.order,
      published: e.published,
    }));

  const formattedServices: Array<ServiceInput & { id: number }> =
    servicesList.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      deliverables: Array.isArray(s.deliverables)
        ? (s.deliverables as string[])
        : [],
      priceFrom: s.priceFrom,
      timeline: s.timeline,
      icon: s.icon,
      order: s.order,
      published: s.published,
    }));

  const formattedTestimonials: Array<TestimonialInput & { id: number }> =
    testimonialsList.map((t) => ({
      id: t.id,
      quote: t.quote,
      name: t.name,
      role: t.role,
      photoUrl: t.photoUrl,
      projectId: t.projectId,
      order: t.order,
      published: t.published,
    }));

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          About, Skills & Services Suite
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your public profile, honeycomb skills matrix, work experience, service packages, and testimonials.
        </p>
      </div>

      <AboutClient
        initialProfile={formattedProfile}
        initialSkillCategories={skillCategories}
        initialExperience={formattedExperience}
        initialServices={formattedServices}
        initialTestimonials={formattedTestimonials}
        mediaAssets={mediaAssets.map((a) => ({ ...a, type: a.type as "image" | "video" }))}
      />
    </div>
  );
}
