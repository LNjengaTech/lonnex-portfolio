import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ==========================================
// 1. SITE SETTINGS & PROFILE (Singletons)
// ==========================================

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("singleton"),
  siteTitle: text("site_title").notNull().default("Lonnex Njenga"),
  tagline: text("tagline").notNull().default("The Hive"),
  heroText: text("hero_text").notNull(),
  navLabels: jsonb("nav_labels").notNull(),
  seoDefaults: jsonb("seo_defaults").notNull(),
  themeOptions: jsonb("theme_options").notNull(),
  footerText: text("footer_text").notNull(),
  cvUrl: text("cv_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profile = pgTable("profile", {
  id: text("id").primaryKey().default("singleton"),
  name: text("name").notNull().default("Lonnex Njenga"),
  shortBio: text("short_bio").notNull(),
  longBio: text("long_bio").notNull(),
  photoUrl: text("photo_url").notNull(),
  photoCrops: jsonb("photo_crops"),
  location: text("location").notNull(),
  timezone: text("timezone").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const availability = pgTable("availability", {
  id: text("id").primaryKey().default("singleton"),
  status: text("status").notNull().default("available"), // "available" | "limited" | "booked"
  message: text("message").notNull(),
  nextAvailableDate: text("next_available_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 2. NOW & BUILD LOG
// ==========================================

export const nowProject = pgTable("now_project", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  progress: integer("progress").notNull().default(0), // 0-100
  stack: jsonb("stack").notNull(), // string[]
  status: text("status").notNull().default("in_progress"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const buildLogEntries = pgTable("build_log_entries", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => nowProject.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  logDate: timestamp("log_date").defaultNow().notNull(),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 3. SKILLS & EXPERIENCE & SERVICES
// ==========================================

export const skillCategories = pgTable("skill_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => skillCategories.id)
    .notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  tier: text("tier").notNull().default("primary"), // "primary" | "secondary" | "familiar"
  years: integer("years").notNull().default(1),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const experience = pgTable("experience", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  org: text("org").notNull(),
  dates: text("dates").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("work"), // "work" | "education"
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  deliverables: jsonb("deliverables").notNull(), // string[]
  priceFrom: text("price_from").notNull(),
  timeline: text("timeline").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 4. WORK (PROJECTS) & MEDIA
// ==========================================

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  role: text("role").notNull(),
  year: text("year").notNull(),
  client: text("client"),
  status: text("status").notNull().default("completed"),
  category: text("category").notNull(), // "web" | "mobile" | "systems" | "open_source"
  tileSize: text("tile_size").notNull().default("M"), // "S" | "M" | "L" | "XL"
  featured: boolean("featured").notNull().default(false),
  order: integer("order").notNull().default(0),
  coverMedia: jsonb("cover_media").notNull(),
  previewVideo: jsonb("preview_video"),
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  problem: text("problem").notNull(),
  approach: text("approach").notNull(),
  result: text("result").notNull(),
  metrics: jsonb("metrics"),
  seo: jsonb("seo"),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectMedia = pgTable("project_media", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  mediaType: text("media_type").notNull().default("image"), // "image" | "video"
  cloudinaryId: text("cloudinary_id").notNull(),
  url: text("url").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  caption: text("caption"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectStack = pgTable("project_stack", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
});

// ==========================================
// 5. STUDIO (WALL OF GRAPHIC ASSETS)
// ==========================================

export const studioCategories = pgTable("studio_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studioCollections = pgTable("studio_collections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studioItems = pgTable("studio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  categoryId: integer("category_id")
    .references(() => studioCategories.id)
    .notNull(),
  collectionId: integer("collection_id").references(
    () => studioCollections.id
  ),
  mediaType: text("media_type").notNull().default("image"),
  mediaUrl: text("media_url").notNull(),
  cloudinaryId: text("cloudinary_id").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  ratio: text("ratio").notNull().default("1:1"), // "16:9", "1:1", "1:3", etc.
  specLabel: text("spec_label").notNull(), // e.g. "Rollup Banner / 85x200cm"
  year: text("year").notNull(),
  confidential: boolean("confidential").notNull().default(false),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 6. JOURNAL (ARTICLES, SERIES, TAGS)
// ==========================================

export const series = pgTable("series", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  coverUrl: text("cover_url"),
  contentJson: jsonb("content_json").notNull(), // Tiptap JSON
  htmlCache: text("html_cache"),
  seriesId: integer("series_id").references(() => series.id),
  seriesPart: integer("series_part"),
  status: text("status").notNull().default("draft"), // "draft" | "scheduled" | "published"
  publishAt: timestamp("publish_at"),
  readingTime: integer("reading_time").notNull().default(1),
  seo: jsonb("seo"),
  canonicalUrl: text("canonical_url"),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articleTags = pgTable("article_tags", {
  articleId: integer("article_id")
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  tagId: integer("tag_id")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
});

// ==========================================
// 7. TESTIMONIALS & CONTACT & MESSAGES
// ==========================================

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  quote: text("quote").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  photoUrl: text("photo_url"),
  projectId: integer("project_id").references(() => projects.id),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactMethods = pgTable("contact_methods", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "email" | "github" | "linkedin" | "x" | "telegram" | "phone"
  label: text("label").notNull(),
  value: text("value").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  briefDetails: jsonb("brief_details"),
  status: text("status").notNull().default("new"), // "new" | "read" | "replied" | "archived"
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 8. MEDIA ASSETS (THE MEDIA LIBRARY)
// ==========================================

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  type: text("type").notNull().default("image"),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  format: text("format").notNull(),
  bytes: integer("bytes").notNull(),
  dominantColor: text("dominant_color"),
  altText: text("alt_text").notNull().default(""),
  tags: jsonb("tags"),
  folder: text("folder").notNull().default("portfolio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 9. AUTH, SESSIONS & AUDIT LOG
// ==========================================

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default("Admin"),
  role: text("role").notNull().default("admin"),
  twoFactorSecret: text("two_factor_secret"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: text("id").primaryKey(), // session token
  userId: integer("user_id")
    .references(() => adminUsers.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => adminUsers.id),
  action: text("action").notNull(), // e.g. "auth.login", "project.create", "settings.update"
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const redirects = pgTable("redirects", {
  id: serial("id").primaryKey(),
  fromPath: text("from_path").notNull().unique(),
  toPath: text("to_path").notNull(),
  statusCode: integer("status_code").notNull().default(301),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
