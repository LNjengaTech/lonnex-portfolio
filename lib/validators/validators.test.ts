import { describe, expect, it } from "vitest";
import { siteSettingsSchema } from "./settings";
import { profileSchema } from "./profile";
import { availabilitySchema } from "./availability";
import { nowProjectSchema, buildLogEntrySchema } from "./now";
import { skillCategorySchema, skillSchema } from "./skills";
import { experienceSchema } from "./experience";
import { serviceSchema } from "./services";
import { testimonialSchema } from "./testimonials";
import { contactMethodSchema, messageStatusSchema } from "./contact";

describe("Phase 4 Admin Validators", () => {
  it("validates site settings schema", () => {
    const valid = {
      siteTitle: "Lonnex Njenga",
      tagline: "The Hive",
      heroText: "Full-stack developer architecting bold digital systems.",
      navLabels: {
        work: "Work",
        studio: "Studio",
        journal: "Journal",
        about: "About",
        now: "Now",
        contact: "Contact",
      },
      seoDefaults: {
        title: "Lonnex Njenga Portfolio",
        description: "Portfolio of Lonnex Njenga",
      },
      themeOptions: {
        defaultTheme: "system" as const,
        allowUserToggle: true,
      },
      footerText: "© 2026 Lonnex Njenga",
      cvUrl: "/cv.pdf",
    };

    const res = siteSettingsSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates profile schema with photo crops", () => {
    const valid = {
      name: "Lonnex Njenga",
      shortBio: "Web developer",
      longBio: "Architectural code and visual identity",
      photoUrl: "https://example.com/photo.jpg",
      photoCrops: { zoom: 1.2, offsetX: 5, offsetY: -2 },
      location: "Nairobi, Kenya",
      timezone: "Africa/Nairobi (EAT, UTC+3)",
    };

    const res = profileSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates availability schema and rejects invalid status", () => {
    const valid = availabilitySchema.safeParse({
      status: "available",
      message: "Open for select contracts",
      nextAvailableDate: "Immediate",
    });
    expect(valid.success).toBe(true);

    const invalid = availabilitySchema.safeParse({
      status: "unknown_status",
      message: "Test",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates now project and build log entry", () => {
    const proj = nowProjectSchema.safeParse({
      title: "The Hive",
      description: "Custom portfolio",
      progress: 80,
      stack: ["Next.js", "TypeScript"],
      status: "in_progress",
    });
    expect(proj.success).toBe(true);

    const log = buildLogEntrySchema.safeParse({
      title: "Built Admin CRUD",
      content: "Engineered phase 4 modules",
      logDate: new Date(),
      order: 1,
      published: true,
    });
    expect(log.success).toBe(true);
  });

  it("validates skill categories and skills", () => {
    const cat = skillCategorySchema.safeParse({
      name: "Commercial Design",
      icon: "Palette",
      order: 1,
      published: true,
    });
    expect(cat.success).toBe(true);

    const skill = skillSchema.safeParse({
      categoryId: 1,
      name: "Next.js",
      icon: "Code2",
      tier: "primary",
      years: 4,
      order: 1,
      published: true,
    });
    expect(skill.success).toBe(true);
  });

  it("validates experience, services, and testimonials", () => {
    const exp = experienceSchema.safeParse({
      role: "Full-Stack Dev",
      org: "Studio",
      dates: "2024 — Present",
      description: "Next.js & PostgreSQL apps",
      type: "work",
      order: 1,
      published: true,
    });
    expect(exp.success).toBe(true);

    const srv = serviceSchema.safeParse({
      title: "Web Development",
      description: "Full applications",
      deliverables: ["Source code", "Admin CMS"],
      priceFrom: "$1,500",
      timeline: "2-4 weeks",
      icon: "Code2",
      order: 1,
      published: true,
    });
    expect(srv.success).toBe(true);

    const test = testimonialSchema.safeParse({
      quote: "Outstanding craftsmanship.",
      name: "Client",
      role: "Founder",
      order: 1,
      published: true,
    });
    expect(test.success).toBe(true);
  });

  it("validates contact methods and message status updates", () => {
    const method = contactMethodSchema.safeParse({
      type: "github",
      label: "GitHub",
      value: "https://github.com/lonnex",
      icon: "Github",
      order: 1,
      visible: true,
    });
    expect(method.success).toBe(true);

    const msgStatus = messageStatusSchema.safeParse({ status: "replied" });
    expect(msgStatus.success).toBe(true);
  });
});

describe("Phase 5 Projects & Studio Validators", () => {
  it("validates project schema with hex tile size and metrics", async () => {
    const { projectSchema } = await import("./projects");

    const validProject = {
      slug: "hive-portfolio",
      title: "The Hive Portfolio",
      summary: "Hexagon-native CMS and portfolio platform.",
      role: "Lead Architect",
      year: "2026",
      client: "Personal",
      status: "in_progress" as const,
      category: "web" as const,
      tileSize: "XL" as const,
      featured: true,
      confidential: false,
      order: 1,
      coverMedia: {
        publicId: "portfolio/hive-cover",
        url: "https://example.com/cover.jpg",
        width: 1200,
        height: 800,
        format: "jpg",
      },
      problem: "Standard layouts fail to convey architectural structure.",
      approach: "Engineered pointy-top hex coordinate math and CMS.",
      result: "High-performance responsive site.",
      metrics: [{ label: "Lighthouse", value: "98" }],
      published: true,
      stack: ["Next.js", "TypeScript", "Drizzle"],
    };

    const res = projectSchema.safeParse(validProject);
    expect(res.success).toBe(true);

    // Invalid slug with uppercase or spaces
    const invalidSlug = projectSchema.safeParse({
      ...validProject,
      slug: "Invalid Slug",
    });
    expect(invalidSlug.success).toBe(false);
  });

  it("validates studio item, category, collection, and bulk schemas", async () => {
    const {
      studioCategorySchema,
      studioCollectionSchema,
      studioItemSchema,
      studioBulkItemSchema,
    } = await import("./studio");

    const catRes = studioCategorySchema.safeParse({
      name: "Rollup Banners",
      slug: "rollup-banners",
      order: 1,
      published: true,
    });
    expect(catRes.success).toBe(true);

    const colRes = studioCollectionSchema.safeParse({
      title: "Event Season 2025",
      slug: "event-season-2025",
      description: "Complete festival assets",
      order: 1,
      published: true,
    });
    expect(colRes.success).toBe(true);

    const itemRes = studioItemSchema.safeParse({
      title: "Music Fest Rollup Banner",
      categoryId: 1,
      collectionId: 1,
      mediaType: "image" as const,
      mediaUrl: "portfolio/banner-01",
      cloudinaryId: "portfolio/banner-01",
      width: 400,
      height: 1200,
      ratio: "1:3",
      specLabel: "Rollup Banner / 85x200cm",
      year: "2025",
      confidential: false,
      order: 1,
      published: true,
    });
    expect(itemRes.success).toBe(true);

    const bulkRes = studioBulkItemSchema.safeParse({
      items: [
        {
          title: "Artwork 1",
          categoryId: 1,
          mediaType: "image" as const,
          mediaUrl: "url-1",
          cloudinaryId: "id-1",
          width: 800,
          height: 600,
          ratio: "4:3",
          specLabel: "Flier / A5",
          year: "2025",
          confidential: false,
        },
      ],
    });
    expect(bulkRes.success).toBe(true);
  });
});

