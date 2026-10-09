# Progress

**Current phase:** 7

## Phases
- [x] 0 Foundation
- [x] 1 Design system
- [x] 2 Data and auth
- [x] 3 Media pipeline
- [x] 4 Admin: settings, profile, now, skills, services, experience, contacts, testimonials
- [x] 5 Admin: projects + studio
- [x] 6 Admin: journal
- [ ] 7 Public shell and Hive home
- [ ] 8a Public: Work
- [ ] 8b Public: Studio
- [ ] 8c Public: Journal
- [ ] 8d Public: About, Now, Contact
- [ ] 9 Polish and performance
- [ ] 10 SEO and launch

## Decisions log
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

## Open issues
- SVG logo mark is an architectural placeholder; replace with finalized brand vector when ready.
- Node and npm commands run on host system by user.
- Cloudinary CDN delivery blocked at account level (x-cld-error: ACL deny) — user must visit https://cloudinary.com/console/ducayuasy → Settings → Security to re-enable delivery.
- Phase 6 requires npm install of new packages (see install command below).

