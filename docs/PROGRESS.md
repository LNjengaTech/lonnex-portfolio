# Progress

**Current phase:** 10

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
- [x] 8c Public: Journal
- [x] 8d Public: About, Now, Contact
- [x] 9 Polish and performance
- [ ] 10 SEO and launch

## Decisions log
- 2026-10-10: Completed Phase 9 Polish & Performance. Configured full standalone installable PWA via @ducanh2912/next-pwa with offline Service Worker caching, web manifest (`public/manifest.json`), apple-web-app tags, and multi-size launcher icons (48px–512px). Configured `build` and `dev` scripts with `--webpack` and `turbopack: {}` in `next.config.ts` so Workbox plugins run cleanly without Next.js 16 Turbopack conflict. Enforced global `prefers-reduced-motion: reduce` blanket reset across all CSS animations, transitions, and scrolling. Completed accessibility and screen-reader pass: added `aria-modal="true"` and auto-focus trapping to `StudioLightbox`, `RadialMenu`, and `CommandPalette`; added `aria-current="location"` to `ArticleToc`; fixed keyboard outline visibility in `SiteHeader`. Created branded public `app/(site)/loading.tsx` (SkeletonHex cluster) and `app/(site)/error.tsx` (hex warning badge + retry button), plus reusable `<HexEmptyState>` for empty filter states in Work, Studio, and Journal. Optimized Next.js bundle and media performance via AVIF/WebP image formats, deviceSizes, Lucide import tree-shaking, Cloudinary CDN preconnect, and `next/dynamic` code-splitting for CommandPalette and HexCursor.
- 2026-10-10: Implemented secret PWA and mobile-friendly admin access unified through the Command Palette: accessible via `⌘K` / `Ctrl+K` on desktop and quick-trigger buttons in both `SiteHeader` (search icon) and `RadialMenu` on mobile devices. Entering the secret `>hive` passphrase unlocks the hidden "Enter The Hive" shortcut to `/admin`. Fixed missing tab favicon by crafting brand hexagonal SVG icon (`app/icon.svg`, mirrored to `public/icon.svg`) and binding to root layout metadata.
- 2026-10-10: Created minimalist geometric UI design asset featuring interconnected hexagonal wireframe clusters (`asset/hex-wireframe-clusters.svg`, `asset/hex-cluster-left.svg`, `asset/hex-cluster-right.svg`, `asset/hex-cluster-mobile.svg`, mirrored to `public/assets/`). Implemented `<HexWireframeClusters>` React component (`components/hex/hex-wireframe-clusters.tsx`) with hollow shapes, ultra-thin hairline strokes (0.65px desktop / 0.55px mobile), dark neon blue accents, transparent background, and proportionally scaled glowing true circular dots (2.1px desktop / 1.5px mobile core) at all shared and key vertices. Integrated site-wide across all public pages (`/`, `/work`, `/work/[slug]`, `/studio`, `/journal`, `/journal/[slug]`, `/about`, `/now`, `/contact`, `/not-found`), including `SiteFooter` and intro `HexLoader`, plus `/styleguide`.
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
- 2026-10-09: Implemented Phase 8c Public Journal — Article index (/journal) with typographic list, search, tag filter chips, and featured essay hex emblem. Calm 68ch reading room (/journal/[slug]) featuring sticky hex-chain TOC tracking active scroll headings, 6-segment hex reading progress bar, adjustable font size controls (A-/A/A+), first-letter drop cap, enhanced copyable code blocks, chamfered pull quotes, series navigation (Part X of N), author profile card with hex photo frame, prev/next article pagination, and related essays by shared tags. Validated RSS 2.0 XML feed route (/rss.xml). Added TOC extractor unit tests in lib/article-toc.test.ts.
- 2026-10-09: Implemented Phase 8d Public About, Now, Contact. About page (/about) features photo in double-offset decorative hex frame, bio and architectural pull quote, Skills Hive with interactive category filtering and tier sizing, Experience & Education vertical chain with connected hex nodes, Services grid with deliverables checklists and direct project CTAs, Testimonials rail, and CV download. Now page (/now) features real-time Nairobi clock, pulsing availability beacon, active sprint project with HexProgressRing, and dated terminal build log entries. Contact page (/contact) features direct contact channel hex buttons (mailto, tel, wa.me, socials, cal.com) and interactive project brief form with project type hex selectors, budget/timeline controls, honeypot spam protection, rate limiting, DB persistence to messages table with Resend email notification hook, and the Hive lock confirmation state.
- 2026-10-09: Hardened project updating validation (updateProjectAction) in lib/validators/projects.ts and projects-client.tsx to flexibly handle both cloudinaryId and publicId properties in coverMedia and previewVideo payloads with safe dimension fallbacks, and added property-path prefixes to validation error messages.
- 2026-10-10: Added article cover image picker to journal editor (Meta tab): replaced plain-text URL input with MediaPicker modal that pulls from the media library, shows a thumbnail preview with hover Change/Remove overlay, and saves the resolved Cloudinary URL. Added ogSection (article:section) field and live OG card preview to the SEO tab. Enhanced public article page with a full-width 2:1 cover hero image above the header. Improved generateMetadata: uses DB profile name for article:author, uses publishAt ?? createdAt for article:published_time, emits article:section from ogSection, and prefers seo.ogImageUrl with coverUrl fallback for OG images with proper 1200×630 dimensions.
- 2026-10-10: Made article formatting toolbar sticky (`sticky top-0 z-20 bg-surface/95 backdrop-blur-md shadow-sm`) so it stays permanently accessible while writing long articles without scrolling up and down. Added inline MediaPicker "Photo" button directly to the editor toolbar to insert photos anywhere inside the article body. Enhanced article sharing: added Web Share API device sharing, compact sharing buttons in the reading room top bar, quick public link copy & view actions directly from the admin article table and the editor sidebar.

## Open issues
- SVG logo mark is an architectural placeholder; replace with finalized brand vector when ready.
- Node and npm commands run on host system by user.
- Cloudinary CDN delivery blocked at account level (x-cld-error: ACL deny) — user must visit https://cloudinary.com/console/ducayuasy → Settings → Security to re-enable delivery.
