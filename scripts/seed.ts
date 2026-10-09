import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import bcrypt from "bcryptjs";
import * as schema from "../lib/db/schema";

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

  // 9. Projects
  const projectRows = await db
    .insert(schema.projects)
    .values([
      {
        slug: "hive-portfolio-engine",
        title: "[Placeholder] The Hive Portfolio Engine",
        summary: "[Placeholder] A hexagon-native, fully CMS-driven portfolio and studio platform built on Next.js 15 and PostgreSQL.",
        role: "Full-Stack Engineer & Designer",
        year: "2026",
        client: "Personal",
        status: "in_progress",
        category: "web",
        tileSize: "XL",
        featured: true,
        order: 1,
        coverMedia: { cloudinaryId: "placeholder/hive-cover", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 800, mediaType: "image" },
        liveUrl: "https://lonnex.dev",
        repoUrl: "https://github.com/lonnex/portfolio",
        problem: "[Placeholder] Existing portfolio solutions lack native hexagon grid layouts, CMS control, and integrated media pipelines.",
        approach: "[Placeholder] Built a custom pointy-top hex packer with axial coordinates, Drizzle ORM schema, and signed Cloudinary uploads.",
        result: "[Placeholder] A fully admin-managed portfolio deployed on Vercel with real-time availability toggle and hex-tile project grid.",
        metrics: { confidential: false, items: [{ label: "Lighthouse Score", value: "98" }, { label: "Admin Modules", value: "12" }] },
        seo: { title: "Hive Portfolio Engine — Lonnex Njenga", description: "Custom hexagon portfolio platform" },
        published: true,
      },
      {
        slug: "nairobi-events-platform",
        title: "[Placeholder] Nairobi Events Platform",
        summary: "[Placeholder] Multi-vendor event ticketing and discovery web app serving Nairobi's entertainment scene.",
        role: "Backend Lead & API Architect",
        year: "2025",
        client: "EventsNBO Ltd",
        status: "completed",
        category: "web",
        tileSize: "L",
        featured: true,
        order: 2,
        coverMedia: { cloudinaryId: "placeholder/events-cover", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 675, mediaType: "image" },
        liveUrl: "https://eventsnbo.co.ke",
        problem: "[Placeholder] Event organisers relied on manual WhatsApp ticket sales with no analytics or fraud prevention.",
        approach: "[Placeholder] Designed a REST + webhook API with Stripe/M-Pesa split, QR ticket validation, and vendor dashboard.",
        result: "[Placeholder] 10,000+ tickets sold in first quarter with zero fraud incidents.",
        metrics: { confidential: false, items: [{ label: "Tickets Sold Q1", value: "10,000+" }, { label: "Fraud Rate", value: "0%" }] },
        published: true,
      },
      {
        slug: "hivelink-mobile",
        title: "[Placeholder] HiveLink Mobile",
        summary: "[Placeholder] Cross-platform Flutter app connecting freelancers with micro-project contracts in East Africa.",
        role: "Mobile Engineer & UX Lead",
        year: "2025",
        client: "HiveLink Ltd",
        status: "completed",
        category: "mobile",
        tileSize: "M",
        featured: false,
        order: 3,
        coverMedia: { cloudinaryId: "placeholder/hivelink-cover", url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 800, mediaType: "image" },
        problem: "[Placeholder] Freelancers lacked a localised marketplace with M-Pesa escrow and Swahili UI support.",
        approach: "[Placeholder] Built with Flutter + Riverpod, Supabase realtime, and custom M-Pesa escrow flow.",
        result: "[Placeholder] 2,000+ active freelancers onboarded within 60 days of launch.",
        metrics: { confidential: false, items: [{ label: "Freelancers (60d)", value: "2,000+" }, { label: "App Store Rating", value: "4.7" }] },
        published: true,
      },
      {
        slug: "brand-identity-system",
        title: "[Placeholder] Brand Identity System CLI",
        summary: "[Placeholder] Node.js CLI that generates branded asset exports (social, print, web) from a single design token file.",
        role: "Tooling Engineer",
        year: "2024",
        client: "Open Source",
        status: "completed",
        category: "open_source",
        tileSize: "M",
        featured: false,
        order: 4,
        coverMedia: { cloudinaryId: "placeholder/brand-cli-cover", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, mediaType: "image" },
        repoUrl: "https://github.com/lonnex/brand-cli",
        problem: "[Placeholder] Designers repeat manual export steps for every asset variant — wasted hours per brand refresh.",
        approach: "[Placeholder] YAML token file parsed into a Puppeteer pipeline that renders Figma exports to sized SVG/PNG batches.",
        result: "[Placeholder] Saves 4+ hours per brand export cycle; used by 3 design studios.",
        metrics: { confidential: false, items: [{ label: "Time Saved / Export", value: "4 hrs" }, { label: "GitHub Stars", value: "142" }] },
        published: true,
      },
      {
        slug: "datacore-systems-dashboard",
        title: "[Placeholder] DataCore Systems Dashboard",
        summary: "[Placeholder] Real-time infrastructure monitoring dashboard for a distributed SCADA system.",
        role: "Systems Engineer",
        year: "2024",
        client: "DataCore Ltd (Confidential)",
        status: "completed",
        category: "systems",
        tileSize: "L",
        featured: false,
        order: 5,
        coverMedia: { cloudinaryId: "placeholder/datacore-cover", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 675, mediaType: "image" },
        problem: "[Placeholder] Legacy SCADA dashboards had 30-second polling delays and no mobile access for field technicians.",
        approach: "[Placeholder] WebSocket-driven Next.js dashboard with role-based access and offline-first PWA shell.",
        result: "[Placeholder] Latency reduced from 30s to sub-200ms; field team response time improved by 40%.",
        metrics: { confidential: true, items: [{ label: "Latency Reduction", value: "150×" }, { label: "Field Response Δ", value: "-40%" }] },
        published: true,
      },
    ])
    .returning();

  // Stack tags
  if (projectRows.length >= 5) {
    await db.insert(schema.projectStack).values([
      // Project 0 — Hive Portfolio
      { projectId: projectRows[0].id, name: "Next.js 15", order: 1 },
      { projectId: projectRows[0].id, name: "TypeScript", order: 2 },
      { projectId: projectRows[0].id, name: "Drizzle ORM", order: 3 },
      { projectId: projectRows[0].id, name: "PostgreSQL", order: 4 },
      { projectId: projectRows[0].id, name: "Cloudinary", order: 5 },
      { projectId: projectRows[0].id, name: "Tailwind CSS", order: 6 },
      // Project 1 — Events Platform
      { projectId: projectRows[1].id, name: "Next.js", order: 1 },
      { projectId: projectRows[1].id, name: "Stripe", order: 2 },
      { projectId: projectRows[1].id, name: "M-Pesa API", order: 3 },
      { projectId: projectRows[1].id, name: "PostgreSQL", order: 4 },
      // Project 2 — HiveLink Mobile
      { projectId: projectRows[2].id, name: "Flutter", order: 1 },
      { projectId: projectRows[2].id, name: "Dart", order: 2 },
      { projectId: projectRows[2].id, name: "Riverpod", order: 3 },
      { projectId: projectRows[2].id, name: "Supabase", order: 4 },
      // Project 3 — Brand CLI
      { projectId: projectRows[3].id, name: "Node.js", order: 1 },
      { projectId: projectRows[3].id, name: "Puppeteer", order: 2 },
      { projectId: projectRows[3].id, name: "SVG", order: 3 },
      // Project 4 — DataCore
      { projectId: projectRows[4].id, name: "Next.js", order: 1 },
      { projectId: projectRows[4].id, name: "WebSocket", order: 2 },
      { projectId: projectRows[4].id, name: "PostgreSQL", order: 3 },
      { projectId: projectRows[4].id, name: "PWA", order: 4 },
    ]);
  }
  console.log("[Seed] Projects and stack tags seeded.");

  // 10. Studio Categories & Collections
  const [catBanners, catFliers, catCards, catVideo, catBrand] = await db
    .insert(schema.studioCategories)
    .values([
      { name: "Rollup Banners", slug: "rollup-banners", order: 1, published: true },
      { name: "Fliers & Posters", slug: "fliers-posters", order: 2, published: true },
      { name: "Business Cards", slug: "business-cards", order: 3, published: true },
      { name: "Video Ads", slug: "video-ads", order: 4, published: true },
      { name: "Brand Identity", slug: "brand-identity", order: 5, published: true },
    ])
    .returning();

  const [colEventSeason, colCorporate] = await db
    .insert(schema.studioCollections)
    .values([
      { title: "Event Season 2025", slug: "event-season-2025", description: "[Placeholder] Complete marketing package for Q3/Q4 event season.", order: 1, published: true },
      { title: "Corporate Pack", slug: "corporate-pack", description: "[Placeholder] Unified corporate identity materials.", order: 2, published: true },
    ])
    .returning();

  if (catBanners && catFliers && catCards && catVideo && catBrand && colEventSeason && colCorporate) {
    // 15 studio items — mixed ratios: portrait, landscape, square, vertical, ultrawide
    await db.insert(schema.studioItems).values([
      // Rollup Banners — portrait 1:3
      { title: "[Placeholder] NBO Music Fest Rollup", categoryId: catBanners.id, collectionId: colEventSeason.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&h=1200&q=80", cloudinaryId: "placeholder/banner-01", width: 400, height: 1200, ratio: "1:3", specLabel: "Rollup Banner / 85×200 cm", year: "2025", order: 1, published: true },
      { title: "[Placeholder] Tech Summit 2025 Rollup", categoryId: catBanners.id, collectionId: colCorporate.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&h=1200&q=80", cloudinaryId: "placeholder/banner-02", width: 400, height: 1200, ratio: "1:3", specLabel: "Rollup Banner / 85×200 cm", year: "2025", order: 2, published: true },
      { title: "[Placeholder] Brand Launch Rollup", categoryId: catBanners.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&h=1200&q=80", cloudinaryId: "placeholder/banner-03", width: 400, height: 1200, ratio: "1:3", specLabel: "Rollup Banner / 60×160 cm", year: "2024", order: 3, published: true },
      // Fliers — 4:3 landscape
      { title: "[Placeholder] Afro Night Flier", categoryId: catFliers.id, collectionId: colEventSeason.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&h=600&q=80", cloudinaryId: "placeholder/flier-01", width: 800, height: 600, ratio: "4:3", specLabel: "A5 Flier / 148×210 mm", year: "2025", order: 1, published: true },
      { title: "[Placeholder] Corporate Gala Invitation", categoryId: catFliers.id, collectionId: colCorporate.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&h=600&q=80", cloudinaryId: "placeholder/flier-02", width: 800, height: 600, ratio: "4:3", specLabel: "A5 Flier / 148×210 mm", year: "2025", order: 2, published: true },
      // Social media — 9:16 vertical
      { title: "[Placeholder] IG Story — Event Countdown", categoryId: catFliers.id, collectionId: colEventSeason.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=540&h=960&q=80", cloudinaryId: "placeholder/social-01", width: 540, height: 960, ratio: "9:16", specLabel: "IG Story / 1080×1920 px", year: "2025", order: 3, published: true },
      { title: "[Placeholder] IG Story — Brand Launch", categoryId: catBrand.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=540&h=960&q=80", cloudinaryId: "placeholder/social-02", width: 540, height: 960, ratio: "9:16", specLabel: "IG Story / 1080×1920 px", year: "2024", order: 1, published: true },
      // Business Cards — 16:9 landscape (standard card ratio)
      { title: "[Placeholder] EventsNBO Business Card", categoryId: catCards.id, collectionId: colCorporate.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1606636660488-16a8646f012c?auto=format&fit=crop&w=800&h=450&q=80", cloudinaryId: "placeholder/card-01", width: 800, height: 450, ratio: "16:9", specLabel: "Business Card / 90×50 mm (landscape)", year: "2025", order: 1, published: true },
      { title: "[Placeholder] Lonnex Dev Card (Front)", categoryId: catCards.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&h=450&q=80", cloudinaryId: "placeholder/card-02", width: 800, height: 450, ratio: "16:9", specLabel: "Business Card / 90×50 mm (landscape)", year: "2025", order: 2, published: true },
      { title: "[Placeholder] Lonnex Dev Card (Back)", categoryId: catCards.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=800&h=450&q=80", cloudinaryId: "placeholder/card-03", width: 800, height: 450, ratio: "16:9", specLabel: "Business Card / 90×50 mm (landscape)", year: "2025", order: 3, published: true },
      // Video Ads — 16:9
      { title: "[Placeholder] Product Reveal 15s Ad", categoryId: catVideo.id, collectionId: colEventSeason.id, mediaType: "video", mediaUrl: "https://images.unsplash.com/photo-1536240478700-b869ad10e2ab?auto=format&fit=crop&w=800&h=450&q=80", cloudinaryId: "placeholder/video-01", width: 1920, height: 1080, ratio: "16:9", specLabel: "Video Ad / 1920×1080 / 15s", year: "2025", order: 1, published: true },
      { title: "[Placeholder] Brand Story 30s Ad", categoryId: catVideo.id, mediaType: "video", mediaUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&h=450&q=80", cloudinaryId: "placeholder/video-02", width: 1920, height: 1080, ratio: "16:9", specLabel: "Video Ad / 1920×1080 / 30s", year: "2024", confidential: true, order: 2, published: true },
      // Brand Identity — square 1:1
      { title: "[Placeholder] HiveLink Logo Suite", categoryId: catBrand.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&h=800&q=80", cloudinaryId: "placeholder/brand-01", width: 800, height: 800, ratio: "1:1", specLabel: "Logo Suite / SVG + PNG export pack", year: "2025", order: 2, published: true },
      { title: "[Placeholder] EventsNBO Brand Guidelines", categoryId: catBrand.id, collectionId: colCorporate.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&h=800&q=80", cloudinaryId: "placeholder/brand-02", width: 800, height: 800, ratio: "1:1", specLabel: "Brand Book / A4 PDF, 24 pages", year: "2025", order: 3, published: true },
      { title: "[Placeholder] DataCore Dashboard Icon Set", categoryId: catBrand.id, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&w=800&h=800&q=80", cloudinaryId: "placeholder/brand-03", width: 800, height: 800, ratio: "1:1", specLabel: "Icon Set / 48 SVG icons", year: "2024", confidential: true, order: 4, published: true },
    ]);
  }
  // 11. Journal: Series, Tags, Articles
  const [seriesHex, seriesDesign] = await db
    .insert(schema.series)
    .values([
      {
        title: "Hexagonal Architecture & The Hive",
        slug: "hexagonal-architecture",
        description: "[Placeholder] Deep dives into non-overlapping coordinate grids, pointy-top axial math, and spatial UX.",
        order: 1,
      },
      {
        title: "Modern Full-Stack Systems",
        slug: "modern-full-stack",
        description: "[Placeholder] Architectural patterns for Next.js, PostgreSQL, and scalable CMS design.",
        order: 2,
      },
    ])
    .returning();

  const [tagArch, tagTs, tagNext, tagDesign] = await db
    .insert(schema.tags)
    .values([
      { name: "Architecture", slug: "architecture" },
      { name: "TypeScript", slug: "typescript" },
      { name: "Next.js", slug: "nextjs" },
      { name: "Design", slug: "design" },
    ])
    .returning();

  if (seriesHex && seriesDesign && tagArch && tagTs && tagNext && tagDesign) {
    const [art1, art2] = await db
      .insert(schema.articles)
      .values([
        {
          title: "Engineering Pointy-Top Hexagonal Grids in TypeScript",
          slug: "engineering-pointy-top-hexagonal-grids",
          excerpt:
            "A technical breakdown of axial coordinate mathematics, distance metrics, and non-overlapping honeycomb packing for reactive canvas layouts.",
          contentJson: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "1. The Geometry of Pointy-Top Hexagons" }],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Unlike standard square grids, a regular pointy-top hexagon introduces 60-degree radial symmetry. Using axial coordinates (q, r), distance and neighbor navigation become linear matrix transformations.",
                  },
                ],
              },
              {
                type: "blockquote",
                content: [
                  {
                    type: "paragraph",
                    text: "A hexagonal system offers uniform adjacent distance in all six directions, eliminating diagonal bias.",
                  },
                ],
              },
            ],
          },
          htmlCache: "<h2>1. The Geometry of Pointy-Top Hexagons</h2><p>Unlike standard square grids, a regular pointy-top hexagon introduces 60-degree radial symmetry. Using axial coordinates (q, r), distance and neighbor navigation become linear matrix transformations.</p><blockquote><p>A hexagonal system offers uniform adjacent distance in all six directions, eliminating diagonal bias.</p></blockquote>",
          seriesId: seriesHex.id,
          seriesPart: 1,
          status: "published",
          readingTime: 5,
          seo: {
            title: "Engineering Hexagonal Grids in TypeScript",
            description: "Deep dive into axial coordinate mathematics and honeycomb packing.",
          },
        },
        {
          title: "High-Impact Commercial Vector Collateral: From Brand Kit to Print",
          slug: "commercial-vector-collateral-print-guide",
          excerpt:
            "Best practices for designing large-format rollup banners, promotional fliers, and high-density business cards that translate flawlessly from screen to print.",
          contentJson: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Precision Specifications for Physical Collateral" }],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "When delivering commercial graphic design, understanding mechanical print limitations—such as 3mm bleed margins, safe visual zones, and CMYK gamut boundaries—is just as vital as code quality.",
                  },
                ],
              },
            ],
          },
          htmlCache: "<h2>Precision Specifications for Physical Collateral</h2><p>When delivering commercial graphic design, understanding mechanical print limitations—such as 3mm bleed margins, safe visual zones, and CMYK gamut boundaries—is just as vital as code quality.</p>",
          seriesId: seriesDesign.id,
          seriesPart: 1,
          status: "draft",
          readingTime: 4,
          seo: {
            title: "Commercial Vector Collateral Print Guide",
            description: "Designing rollup banners and fliers for large format print.",
          },
        },
      ])
      .returning();

    if (art1 && art2) {
      await db.insert(schema.articleTags).values([
        { articleId: art1.id, tagId: tagArch.id },
        { articleId: art1.id, tagId: tagTs.id },
        { articleId: art1.id, tagId: tagNext.id },
        { articleId: art2.id, tagId: tagDesign.id },
      ]);
    }
  }
  console.log("[Seed] Journal series, tags, articles, and article-tags seeded.");

  console.log("Database seeded successfully with realistic placeholder content!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
