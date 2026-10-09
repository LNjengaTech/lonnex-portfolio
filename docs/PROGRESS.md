# Progress

**Current phase:** 8c

## Phases
- [x] 0 Foundation
- [x] 1 Design system
- [x] 2 Data and auth
- [x] 3 Media pipeline
- [x] 4 Admin: settings, profile, now, skills, services, experience, contacts, testimonials
- [x] 5 Admin: projects + studio
- [x] 6 Admin: journal
- [x] 7 Public shell and Hive home
- [x] 8a Public: Work
- [x] 8b Public: Studio
- [ ] 8c Public: Journal
- [ ] 8d Public: About, Now, Contact
- [ ] 9 Polish and performance
- [ ] 10 SEO and launch

## Decisions log
- 2026-10-09: Implemented Phase 8a Public Work — Honeycomb Wall (packed non-overlapping axial mosaic aware of S/M/L/XL tile sizes on desktop, interlocking vertical zig-zag on mobile), Index view (giant 8vw typography with floating cursor-following hex preview), and Timeline view (horizontal 60-degree zig-zag with connecting axial guideline and year milestones).
- 2026-10-09: Implemented dynamic category and tech stack filters with signature Hive behavior: non-matching hexes flip to outline-only wireframe mode instead of disappearing, preserving honeycomb integrity.
- 2026-10-09: Built full case study page (/work/[slug]) featuring hero with role, title, summary, action links, and shared-element hex cover transition (`view-transition-name: project-hero-${slug}`); key metrics strip with confidential shield; Problem / Approach / Result three big numbered blocks; embedded video walkthrough; mixed-size chamfered gallery with full-screen keyboard-accessible modal lightbox; client testimonial card; sticky facts column; and "Next project" hex navigation at footer.
- 2026-10-09: Added cached public queries `getPublishedProjectsWithDetails` and `getPublishedProjectDetailBySlug` with tag-based cache revalidation ("projects", "project_media", "testimonials") and updated seed script with gallery media and client testimonials.
- 2026-10-09: Implemented Phase 7 Public Shell and Hive Home with zero hardcoded content from DB.
- 2026-10-09: Constructed mathematically exact 7-hexagon honeycomb cluster on tablet & desktop (H=136/164px) with photo at center and 6 surrounding rooms (Work, Studio, Journal, About, Now, Contact) and interlocking vertical zig-zag column on mobile (<640px).
- 2026-10-09: Built first-visit HexLoader with typewriter effect and sessionStorage gate, custom pointy-top HexCursor (desktop only), and Cmd/K CommandPalette.
- 2026-10-09: Added responsive RadialMenu with touch-friendly 60-degree radial hex cells, fixed SiteHeader with availability beacon, and SiteFooter with live Nairobi clock.
- 2026-10-09: Integrated CSS View Transitions API for page transitions and crafted custom broken-hex 404 page.
- 2026-10-08: Pinned exact latest stable versions (Next.js 16.4.0, React 19.3.0, Tailwind v4.3.3) per stability rules.
- 2026-10-08: Sourced colors exclusively via CSS variables in app/globals.css with inline theme initialization script to prevent flash.
- 2026-10-08: Implemented pointy-top hexagon geometry helpers and shadcn/ui components configured with radius 0.
- 2026-10-08: Implemented axial hex math, roundtrip coordinate conversion, and non-overlapping honeycomb packer for 1x, 2x, 3x hexes in lib/hex.ts with full unit tests.
- 2026-10-08: Created brand SVG primitives (solid, outline, slashed, triple cluster) and placeholder architectural logo mark/lockup using currentColor.
- 2026-10-08: Restyled 14 shadcn primitives to zero-radius base with chamfered cuts, hex close buttons, and semantic tokens.
- 2026-10-08: Created comprehensive hidden /styleguide page showcasing every component across light and dark themes.
- 2026-10-08: Defined full Drizzle PostgreSQL schema covering all Blueprint 6.3 entities (projects, studio, articles, skills, now, profile, settings, media, audit log).
- 2026-10-08: Implemented single-admin auth with HttpOnly secure session cookies, bcrypt hashing, and strict server-side route guards.
- 2026-10-08: Built protected admin shell under (dashboard) route group with hex-icon navigation, live audit logging, and seed script.
- 2026-10-09: Implemented Cloudinary signed-upload pipeline (sign route → direct browser upload → DB save). Added cloudinary@2.11.0 and next-cloudinary@6.19.3.
- 2026-10-09: Built CloudImage (f_auto,q_auto,srcset,dominant-color placeholder) and CloudVideo (adaptive delivery,poster,hex play button).
- 2026-10-09: Built MediaUploader (drag-drop,multi-file,progress,cancel), MediaPicker (searchable modal), MediaLibraryClient (alt-text editing, safe delete).
- 2026-10-09: Switched asset deletion to Cloudinary Admin API (delete_resources) with { invalidate: true } to guarantee complete multi-resource and video removal from Cloudinary and worldwide CDN cache.
- 2026-10-09: Verified local PostgreSQL database connectivity, pushed full 27-table schema, and verified admin authentication.
- 2026-10-09: Implemented complete Phase 4 Admin CRUD modules (Settings, Profile, Now, Skills, Experience, Services, Testimonials, Contacts, Messages inbox).
- 2026-10-09: Built one-click instant availability toggle dropdown in AdminHeader with server action and tag-based cache revalidation.
- 2026-10-09: Built HexPhotoPreview featuring pointy-top geometry with layered brand offset wireframes, zoom, and panning controls.
- 2026-10-09: Created reusable SortableListItem with HTML5 drag-and-drop reordering, keyboard up/down controls, and published toggles.
- 2026-10-09: Established complete Zod validation schemas in lib/validators, query library in lib/db/queries, and server actions with requireAuth and audit logging.
- 2026-10-09: Built Projects admin module with tile size (S/M/L/XL), featured status, confidential/blurred mode, video preview swap, metrics, stack tags, and live pointy-top HexTilePreview.
- 2026-10-09: Built Studio admin module with 3-tab layout (Wall, Bulk Ingest, Categories/Collections), automatic aspect ratio detection (1:3, 4:3, 16:9, 1:1, 9:16), bulk category assignment, and bulk deletion.
- 2026-10-09: Seeded 5 realistic code projects and 15 mixed-ratio commercial studio items (portrait, landscape, square, vertical, video).
- 2026-10-09: Added resolveMediaUrl() helper in lib/cloudinary-utils.ts to convert bare Cloudinary publicIds to absolute URLs, preventing relative-path 404s across all admin pickers.
- 2026-10-09: CloudImage now uses unoptimized prop + ImageOff fallback for resilient rendering when Cloudinary CDN is unreachable.
- 2026-10-09: Created lib/cache.ts wrapper for revalidateTag/revalidatePath with stable 1-arg signature across Next.js version changes.
- 2026-10-09: Added export const dynamic = "force-dynamic" to admin (dashboard) layout to suppress static pre-render warnings at build time.
- 2026-10-09: Build passes clean (0 TS errors, 0 lint errors). All admin routes correctly render as ƒ (Dynamic).
- 2026-10-09: Built Phase 6 Journal admin — Tiptap v3 editor (bold/italic/headings/lists/blockquote/code blocks via lowlight, links), .md import (gray-matter + regex parser), .docx import (mammoth), .md export (YAML front matter), draft/scheduled/published workflow with datetime scheduling, tags and series management, autosave every 30s, write/meta/SEO tabs with SERP preview, word count and reading-time stats.
- 2026-10-09: Engineered responsive, retractable Admin UI shell (AdminShell) with slide-out overlay drawer for mobile screens (<768px), hex hamburger toggle in AdminHeader, auto-close on navigation/escape/backdrop, and desktop collapsible icon rail with persisted preference.
- 2026-10-09: Made database seed script (scripts/seed.ts) fully idempotent across all entities (nowProject, skills, services, contacts, projects, studio, journal series/tags/articles) to safely permit re-runs without constraint errors.
- 2026-10-09: Implemented Phase 8b Public Studio — "The Wall". Justified-rows + tall-rail layout engine in lib/studio-layout.ts (no layout shift; all dimensions from DB width/height). Components: StudioWall (client, category filter, ResizeObserver, video cap at 2 simultaneous), StudioLightbox (zoom/pan, keyboard nav, touch swipe, video support, spec panel), StudioCollectionPile (stacked offset pile, fans out on click), StudioFilterChips (hex category buttons). Server page at app/(site)/studio/page.tsx with cached queries tagged studio_categories/studio_collections/studio_items. 6 unit tests for layout engine.

## Open issues
- SVG logo mark is an architectural placeholder; replace with finalized brand vector when ready.
- Node and npm commands run on host system by user.
- Cloudinary CDN delivery blocked at account level (x-cld-error: ACL deny) — user must visit https://cloudinary.com/console/ducayuasy → Settings → Security to re-enable delivery.
