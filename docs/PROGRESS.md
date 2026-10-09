# Progress

**Current phase:** 4

## Phases
- [x] 0 Foundation
- [x] 1 Design system
- [x] 2 Data and auth
- [x] 3 Media pipeline
- [ ] 4 Admin: settings, profile, now, skills, services, experience, contacts, testimonials
- [ ] 5 Admin: projects + studio
- [ ] 6 Admin: journal
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

## Open issues
- SVG logo mark is an architectural placeholder; replace with finalized brand vector when ready.
- Node and npm commands run on host system by user.
