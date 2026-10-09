import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import bcrypt from "bcryptjs";
import * as schema from "../lib/db/schema.ts";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set in environment or .env. Skipping seed.");
  process.exit(0);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("Starting database seed with realistic placeholder data...");

  // 1. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@lonnex.dev";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await db
    .insert(schema.adminUsers)
    .values({
      email: adminEmail,
      passwordHash,
      name: "Lonnex Njenga",
      role: "admin",
    })
    .onConflictDoNothing({ target: schema.adminUsers.email });

  console.log(`[Seed] Admin user seeded: ${adminEmail}`);

  // 2. Site Settings
  await db
    .insert(schema.siteSettings)
    .values({
      id: "singleton",
      siteTitle: "Lonnex Njenga — The Hive",
      tagline: "The Hive",
      heroText:
        "[Placeholder] Full-stack cross-platform developer and commercial graphic designer architecting bold digital systems.",
      navLabels: {
        work: "Work",
        studio: "Studio",
        journal: "Journal",
        about: "About",
        now: "Now",
        contact: "Contact",
      },
      seoDefaults: {
        title: "Lonnex Njenga — Web Developer & Graphic Designer",
        description:
          "Portfolio and studio of Lonnex Njenga: Full-stack applications and commercial graphics.",
      },
      themeOptions: {
        defaultTheme: "system",
        allowUserToggle: true,
      },
      footerText: "© 2026 Lonnex Njenga. All rights reserved.",
      cvUrl: "/cv-placeholder.pdf",
    })
    .onConflictDoNothing({ target: schema.siteSettings.id });

  // 3. Profile
  await db
    .insert(schema.profile)
    .values({
      id: "singleton",
      name: "Lonnex Njenga",
      shortBio:
        "[Placeholder] Web and mobile developer and graphic designer with an architectural approach to code and visual identity.",
      longBio:
        "[Placeholder] Specialising in TypeScript, Next.js, Flutter, and commercial brand collateral from high-impact banners to complete digital identities.",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      location: "Nairobi, Kenya",
      timezone: "Africa/Nairobi (EAT, UTC+3)",
    })
    .onConflictDoNothing({ target: schema.profile.id });

  // 4. Availability
  await db
    .insert(schema.availability)
    .values({
      id: "singleton",
      status: "available",
      message:
        "[Placeholder] Open for select web development contracts and commercial brand commissions.",
      nextAvailableDate: "Immediate",
    })
    .onConflictDoNothing({ target: schema.availability.id });

  // 5. Now Project & Build Log
  const [createdProject] = await db
    .insert(schema.nowProject)
    .values({
      title: "[Placeholder] The Hive Portfolio Engine",
      description:
        "[Placeholder] Constructing a custom hexagon-native portfolio with full CMS control and media pipeline.",
      progress: 75,
      stack: ["Next.js", "TypeScript", "Drizzle", "PostgreSQL", "Tailwind"],
      status: "in_progress",
    })
    .returning();

  if (createdProject) {
    await db.insert(schema.buildLogEntries).values([
      {
        projectId: createdProject.id,
        title: "[Placeholder] Hex coordinate system and layout packer",
        content:
          "Engineered axial-to-pixel conversions and non-overlapping honeycomb layout packing logic for mixed hex tiles.",
        order: 1,
        published: true,
      },
      {
        projectId: createdProject.id,
        title: "[Placeholder] Database schema and single-admin auth",
        content:
          "Established PostgreSQL schema via Drizzle and implemented secure session cookies and audit logging.",
        order: 2,
        published: true,
      },
    ]);
  }

  // 6. Skill Categories & Skills
  const [catWeb] = await db
    .insert(schema.skillCategories)
    .values({ name: "Web & Full-Stack", icon: "Globe", order: 1, published: true })
    .returning();

  const [catDesign] = await db
    .insert(schema.skillCategories)
    .values({ name: "Commercial Design", icon: "Palette", order: 2, published: true })
    .returning();

  if (catWeb && catDesign) {
    await db.insert(schema.skills).values([
      { categoryId: catWeb.id, name: "Next.js & React", icon: "Code2", tier: "primary", years: 4, order: 1, published: true },
      { categoryId: catWeb.id, name: "TypeScript", icon: "FileCode", tier: "primary", years: 4, order: 2, published: true },
      { categoryId: catWeb.id, name: "PostgreSQL & Drizzle", icon: "Database", tier: "primary", years: 3, order: 3, published: true },
      { categoryId: catDesign.id, name: "Figma & Vector Design", icon: "PenTool", tier: "primary", years: 5, order: 1, published: true },
      { categoryId: catDesign.id, name: "Commercial Fliers & Banners", icon: "Image", tier: "primary", years: 5, order: 2, published: true },
    ]);
  }

  // 7. Services
  await db.insert(schema.services).values([
    {
      title: "Full-Stack Web Development",
      description:
        "[Placeholder] Modern Next.js applications, performant APIs, responsive UI systems, and PostgreSQL architectures.",
      deliverables: ["Full application source", "Automated deployment", "Admin CMS", "Documentation"],
      priceFrom: "$1,500",
      timeline: "2-4 weeks",
      icon: "Code2",
      order: 1,
      published: true,
    },
    {
      title: "Commercial Graphic Design",
      description:
        "[Placeholder] High-conversion marketing banners, event fliers, business stationery, and social media brand packs.",
      deliverables: ["Print-ready vectors", "Web-optimized exports", "Source files", "Social variants"],
      priceFrom: "$300",
      timeline: "3-7 days",
      icon: "Palette",
      order: 2,
      published: true,
    },
  ]);

  // 8. Contact Methods
  await db.insert(schema.contactMethods).values([
    { type: "email", label: "Email", value: "hello@lonnex.dev", icon: "Mail", order: 1, visible: true },
    { type: "github", label: "GitHub", value: "https://github.com/lonnex", icon: "Github", order: 2, visible: true },
    { type: "linkedin", label: "LinkedIn", value: "https://linkedin.com/in/lonnex", icon: "Linkedin", order: 3, visible: true },
  ]);

  console.log("Database seeded successfully with realistic placeholder content!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
