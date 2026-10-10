# Lonnex Njenga Portfolio: Design & Build Blueprint

*Concept: THE HIVE. A portfolio built as one continuous honeycomb. Hand this document to Antigravity at the start of every phase.*

## 1. The Big Idea: "The Hive"

A normal portfolio is a page you scroll. This one is a **place you move through**. The logo is a pointy-top hexagon cut into three interlocking pieces, and the whole site is built from that same geometry.

**Why it works for you:** a hexagon has exactly six sides, and your site has exactly six rooms. The home screen is a honeycomb where the center cell is you, and each of the six neighbours is a room.

| Side | Room | What lives there |
| --- | --- | --- |
| 1 | **Work** | Web apps, mobile apps, systems (code projects) |
| 2 | **Studio** | Banners, fliers, business cards, videos, mockups |
| 3 | **Journal** | Tech articles |
| 4 | **About** | Photo, story, skills, experience, services |
| 5 | **Now** | Availability, current project, build log |
| 6 | **Contact** | Every way to reach you, plus the project brief form |

### Seven signature moves (these make it unforgettable)

1. **Hex navigation.** The home screen is a living honeycomb. Hovering a cell expands it while neighbours reflow. A radial hex menu is also available from any page.
2. **"The Cut."** Your logo is defined by thin gaps slicing through solid shapes. That gap becomes a motion and layout device: headlines, images and panels *reveal* by sliding along a 60-degree cut line.
3. **Logo-assembly loader.** The three pieces of the mark fly in and lock together, then the site opens.
4. **Hex tile page transitions.** Moving between rooms triggers a wave of hexagons flipping across the screen (solid blue, then navy), revealing the next page.
5. **Dimension lines on design work.** Every banner, flier and card in Studio is drawn with engineering-style measurement lines and a size label (for example "85 x 55 mm" or "1920 x 1080"), like a technical drawing. Nobody else does this, and it turns *size variety* into a feature.
6. **Live Nairobi beacon.** A pulsing hex status light plus a live Nairobi clock (EAT). It shows availability and the current project, so the site feels alive.
7. **Hex cursor.** On desktop the cursor is a small hexagon that morphs: outline on idle, filled on links, "VIEW" on projects, play icon on videos, and a crosshair over design work.

## 2. Design Principles

1. **Hexagon geometry only.** Pointy-top orientation always (matches the logo). Only 0, 30, 60, 90, 120 degree angles. No random rotations.
2. **Solid colour only.** No gradients, no glows, no blurred shadows. Depth comes from **hard offset blocks** (a solid blue or navy shape offset 8px behind an element) and from layering.
3. **Exaggerate scale.** Giant Montserrat headlines (up to 18vw) set against tiny, wide-tracked labels. Extreme contrast between big and small is the signature.
4. **Blueprint meets editorial.** Faint hex grid lines, coordinate labels, numbered sections (01, 02...), small metadata in monospace. It should feel like an architect's sheet crossed with a magazine.
5. **Motion has a grammar.** Everything enters along a 60-degree cut, flips like a hex tile, or scales from a vertex. Nothing just "fades up" like a template.
6. **Content is never cropped to fit the design.** The design bends to the content (see Studio).
7. **Dark is the home, light is the studio.** Dark mode is the default hero experience. Light mode is a full redesign of tone (paper-white, navy ink), not just inverted colours.

## 3. Visual System

### 3.1 Colour tokens (from your board, unchanged)

| Token | Hex | Dark mode use | Light mode use |
| --- | --- | --- | --- |
| `--primary` | `#0066FF` | Brand, CTAs, fills | Brand, CTAs, fills |
| `--navy` | `#0B0F17` | Page background | Primary text |
| `--white` | `#FFFFFF` | Primary text | Cards / surfaces |
| `--slate-100` | `#F1F5FF` | n/a | Page background |
| `--slate-200` | `#CBD5E1` | Text on blue | Borders / dividers |
| `--slate-400` | `#64748B` | Secondary text | Secondary text |
| `--slate-600` | `#334155` | Borders / dividers | Muted text |

**Rules:**

- Blue text on navy is about 4:1 contrast, so use it only for large text (24px and up) or icons. Small text on navy is white or slate-200.
- One functional exception: the availability dot may use green (Available), amber (Limited), red (Booked). These are status signals, not brand colours.
- Dark and light are implemented as CSS variables on `:root` and `[data-theme="dark"]`. Default to the system preference, remember the choice, and avoid any flash of the wrong theme on load (inline script in the head).
- The theme toggle is a hex that flips (navy side, white side).

### 3.2 Typography

- **Montserrat** (primary, from your board): weights 300, 500, 700, 800, 900.
  - Display: 900, tight tracking (-0.04em), uppercase optional.
  - Headings: 800 / 700.
  - Body: 500, 1.7 line height, 17-18px, 68 characters max line length.
  - Labels: 600, uppercase, **0.3em tracking** (like "BUILD / DESIGN / SOLVE").
- **Secondary: JetBrains Mono** for metadata, dimension labels, coordinates, code and the build log. *(My addition, since your board lists only Montserrat. Remove it if you want one family only.)*
- Load with `next/font`, subset Latin, `display: swap`.

### 3.3 Hex geometry helpers (build once, use everywhere)

- Pointy-top clip-path: `polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)`.
- Regular hex ratio: width = 0.866 x height.
- Create `lib/hex.ts` with axial coordinates (q, r) to pixel conversion, a neighbour function, and a **honeycomb packer** that places hexes of sizes 1x, 2x and 3x without overlap. Also a `<Hex>` component (SVG + clip-path, props: size, fill, stroke, children) and `<HexGrid>`.
- **Chamfer frame:** a rectangle with two opposite corners cut at 60 degrees. This is how rectangular design work is framed, using the hex's DNA without cropping.

### 3.4 Brand elements to reuse

From your board: solid hex, outlined hex, hex with the slash cut, and the triple-hex cluster. Use them as dividers, bullet markers, loaders, empty states, section numbers, tag chips and the favicon family. Export each as an inline SVG React component with `currentColor`.

### 3.5 Iconography and shape rules

Lucide icons only, 1.75 stroke, always sitting inside a small hex outline as their container. Buttons are pill or hex-capped (left and right ends cut at 60 degrees). Inputs have a single chamfered corner. Focus rings are 2px `--primary` outlines with a 3px offset.

## 4. The Rooms (Page-by-Page Design)

### 4.1 Home: "The Hive"

- **Loader (first visit only):** logo pieces assemble, then "Ideas. Code. Impact." types in, then the hive opens.
- **Centre cell:** your hex-cropped photo with a hard offset blue hex behind it. Name in giant Montserrat 900 wraps around the hive.
- **Six neighbour cells**, one per room, each with a number, label and a live micro-preview (latest article title, current project name, availability dot, count of works).
- **Hover:** the cell scales from its vertex, neighbours push away along axial directions, and the label becomes a 6xl headline.
- **Idle:** the faint background hex grid breathes very slowly. Pausing and reduced motion are supported.
- **Stats strip** ("10+ Web Apps / 5+ Mobile Apps / 20+ Design Projects"): computed from the database, never typed.
- **Mobile:** the honeycomb becomes a vertical zig-zag of large hex cells. Tap to enter. No hover dependencies.

### 4.2 Work (code projects): "The Honeycomb Wall"

Projects are **not cards.** Each one is a hex tile in a honeycomb mosaic, and tile size comes from importance.

- Sizes **S / M / L / XL** are set per project in the admin. An XL tile is a hex roughly 3 cells across showing a looping preview.
- Each tile shows the project cover (hex-cropped), a number, title and stack hexes on hover. The cover swaps to an animated preview (short video or GIF) on hover.
- **Three view modes** (toggle at top):
  1. **Hive:** the honeycomb mosaic (default).
  2. **Index:** a giant typographic list (project names at 8vw). Hovering a name makes a hex preview follow the cursor. Fast and dramatic.
  3. **Timeline:** projects along a horizontal 60-degree zig-zag by year.
- Filters: Web, Mobile, Systems, Open source, plus a stack filter. Non-matching hexes **flip to outline-only** instead of disappearing, so the hive structure stays intact.
- **Click behaviour:** the chosen hex expands to fill the screen (shared-element transition) and becomes the case study.
- **Case study page:** hero with title and role; a facts column (year, client, stack, duration, status); "Problem / Approach / Result" as three big numbered blocks; a gallery (mixed sizes, lightbox); embedded video walkthrough; metrics; live and repo links; testimonial; and a "Next project" hex at the bottom that the page flows into.

### 4.3 Studio (banners, fliers, cards, videos, mockups): "The Wall"

**The problem:** every item has a different size and ratio, from a 1:3 roll-up banner to a 16:9 ad to a business card.

**The solution:** never force a grid cell. Respect each item's true ratio.

- **Layout engine:** a justified-rows algorithm for landscape work (rows fill the width, each item's height flexes to keep ratios), combined with a **"tall rail"**: portrait items (roll-ups, posters) sit in a vertical strip beside the rows or in a horizontal rail. Width and height come from Cloudinary on upload, so the layout is computed before images load (no layout shift).
- **Frame:** the chamfered-corner frame plus dimension lines on hover. Each item carries a spec tag: type, size, medium (print/digital), year.
- **Videos:** muted looping preview on hover or in view; click opens the Cloudinary player in a lightbox. Vertical, square and horizontal videos are all supported.
- **Lightbox:** zoom and pan for large artwork, keyboard navigation, swipe on mobile, "before/after" support for mockups, and a spec panel.
- **Categories** (managed in admin): Banners, Fliers, Business Cards, Brand Identity, Social, Video Ads, Mockups. Filter chips are hexes. Switching category re-packs the wall with an animated shuffle.
- **Collections:** group items into a **project set** (for example "Brand X: card + flier + banner") shown as a stacked, offset pile that fans out on click.
- **Background surface:** Studio uses a contrasting surface (light slate on dark mode, navy on light mode) so artwork pops like a gallery wall.

### 4.4 Journal (articles)

- **Index:** a big typographic list. Each row has a number, title, excerpt, reading time, date and tag hexes. A featured article gets an oversized hex cover. Search and tag filters included.
- **Article page:** a calm reading room, with the hive quiet in the background.
  - Left: a sticky **hex-chain table of contents** that fills in blue as you scroll.
  - Centre: a 68ch column, big H1, a drop cap, and H2 headings with hex numbering. Pull quotes with a cut-corner border.
  - Code blocks: Shiki syntax highlighting, filename tab, copy button, line highlights.
  - Callouts (Tip, Warning, Note), images with captions, tables, embeds (YouTube, CodeSandbox, X), and footnotes.
  - Reading progress bar made of six hex segments. Estimated read time. Share buttons (copy link, X, LinkedIn, WhatsApp).
  - Footer: author card, previous / next, and related articles by tag. Optional **series** navigation (Part 1 of 4).
- Light and dark reading themes both polished, with an adjustable text size.

### 4.5 About

- Photo in a hex frame with two layered offset hexes. A short story and a pull quote.
- **Skills as a hive:** each skill is a hex. Size or fill shows proficiency tier (Core, Strong, Learning), grouped by category (Frontend, Backend, Mobile, Design, Video, Tools). Hover shows years and related projects. All of it is dynamic.
- **Experience and education** as a vertical chain of hexes.
- **Services** (Web apps, Mobile apps, Systems, Graphic design, Video ads): each with description, deliverables, starting price or "from" range, typical timeline and a "Start this" button.
- Testimonials rail. CV / resume download button (PDF uploaded in admin).

### 4.6 Now

- **Availability** with a large beacon: Available / Limited / Booked, a custom message, "next availability date", and the live Nairobi clock.
- **Current project:** title, short description, progress ring (hex-shaped), stack, status and a **build log** (dated short entries you post from admin in seconds, "/now" page style).
- Optional: currently reading, learning or listening.

### 4.7 Contact

- Contact methods as large hex buttons: Email, WhatsApp (click-to-chat), Phone, LinkedIn, GitHub, X, Behance, Instagram, and a booking link (Cal.com). All managed from admin, so you can add or remove any method.
- **"Start a project" brief form:** project type (chosen from hexes), budget range, timeline, description, file attachments (Cloudinary). Messages land in the admin inbox and as an email (Resend).
- Spam protection: honeypot field, rate limiting and Cloudflare Turnstile.
- Confirmation state: the hive "locks" with a success animation. Response-time expectation shown.

### 4.8 Global UI

- **Command palette (Cmd/Ctrl + K):** jump to any room, project, article, or toggle the theme. Fits a developer audience.
- **Radial hex menu** and a minimal top bar (logo, availability dot, theme toggle, menu).
- **404 page:** a broken hex with a "cell not found" message and a link home.
- **Footer:** the "More than code. It's a vision." tagline, the triple-hex cluster, social links and the Nairobi clock.
- **Easter egg:** typing "hex" makes the whole site's cells ripple. Small delights are memorable.

## 5. Motion Spec

- Library: **Motion** (Framer Motion) for layout and shared-element transitions; the browser **View Transitions API** where supported; CSS for micro-interactions. Add GSAP only if a timeline gets complex.
- Timing: micro 150-200ms, component 300-450ms, page 700-900ms. Easing: `cubic-bezier(0.76, 0, 0.24, 1)` (sharp in-out) for cuts, spring (stiffness 260, damping 24) for hex pops.
- **Reduced motion:** honour `prefers-reduced-motion` (swap flips for instant fades, stop the idle grid). This is required.
- **Performance budget:** Largest Contentful Paint under 2.5s on mobile 4G, 60fps interactions, total JS under about 250KB on first load for the home page. Heavy animation is code-split and lazy.

## 6. Technical Architecture

### 6.1 Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router), TypeScript, server components by default |
| Styling | Tailwind with tokens above; shadcn/ui customised (see 6.4) |
| Icons | lucide-react |
| Database | PostgreSQL (Neon or Supabase) with **Drizzle** or Prisma |
| Media | Cloudinary (signed direct browser uploads; images and video) |
| Auth (admin) | Better Auth or Auth.js: single admin, email + passkey or 2FA |
| Editor | **Tiptap** (block-style rich text, stored as JSON) |
| Code highlighting | Shiki |
| Validation / forms | Zod, React Hook Form, server actions |
| Email | Resend |
| PWA | @ducanh2912/next-pwa (standalone installable, service worker, manifest) |
| Analytics | Umami or Plausible (privacy-friendly) |
| Hosting | Vercel |

### 6.2 Folder structure

```
app/
  (site)/ page.tsx, work/, studio/, journal/, about/, now/, contact/
  admin/  (protected layout)
  api/    uploads/sign, contact, revalidate
components/ hex/, ui/ (shadcn), site/, admin/
lib/ hex.ts, cloudinary.ts, db/, auth.ts, seo.ts
```

### 6.3 Data model (everything the UI shows comes from here)

- **site\_settings** (singleton): site title, tagline, hero text, nav labels, SEO defaults, theme options, OG defaults, footer text, CV file.
- **profile**: name, short bio, long bio, photo (several crops), location, timezone.
- **availability**: status, message, next\_available\_date.
- **now\_project** + **build\_log\_entries**: title, description, progress, stack, status; dated log entries.
- **skill\_categories**, **skills**: name, icon, tier, years, order.
- **experience**: role, org, dates, description, type (work/education).
- **services**: title, description, deliverables, price\_from, timeline, icon.
- **projects**: slug, title, summary, role, year, client, status, category, tile\_size (S/M/L/XL), featured, order, cover media, preview video, live\_url, repo\_url, problem/approach/result (rich text), metrics, SEO, published.
- **project\_media**, **project\_stack** (tags): gallery items with Cloudinary id, width, height, caption.
- **studio\_categories**, **studio\_items**: title, category, media (image or video), width, height, ratio, spec label (size, medium), year, collection\_id, order, published.
- **studio\_collections**: grouped sets.
- **articles**: slug, title, excerpt, cover, content (Tiptap JSON), HTML cache, tags, series + part, status (draft/scheduled/published), publish\_at, reading\_time, SEO, canonical\_url, views.
- **tags**, **series**.
- **testimonials**: quote, name, role, photo, linked project.
- **contact\_methods**: type, label, value, icon, order, visible.
- **messages**: brief form submissions with status (new/read/replied/archived).
- **media\_assets**: public\_id, type, width, height, format, bytes, dominant colour, alt text, tags (the media library).
- **redirects** (optional) and **audit\_log**.

All lists have `order` (drag-and-drop), `published`, `created_at`, `updated_at`.

### 6.4 Customising shadcn

Override shadcn tokens with the palette. Restyle: **Button** (hex-capped), **Input** (chamfered corner), **Dialog** (cut corner, hex close button), **Tabs** (hex chips), **Badge** (hex), **Switch** (hex thumb), **Command** (palette), **Sheet**, **Tooltip**, **Toast**, **Table**, **Select**. Use radius 0 as the base (angles, not curves). Admin reuses these so the whole product feels like one system.

### 6.5 Cloudinary strategy

- **Signed upload** from the browser (API route issues the signature), with drag-and-drop, multi-file, progress and cancel.
- On upload, save `public_id`, `width`, `height`, `format`, `resource_type`, bytes, plus a dominant colour for placeholders.
- Deliver with `f_auto,q_auto` and responsive `srcset`; blur or dominant-colour placeholder; video via adaptive streaming; poster and short preview clips generated from the same asset.
- Folders: `portfolio/projects`, `portfolio/studio`, `portfolio/articles`, `portfolio/profile`.
- Photo upload offers a built-in hex crop preview.
- Check Cloudinary plan limits for video size and bandwidth early.

### 6.6 Rendering and caching

Public pages use static or incremental rendering with **tag-based revalidation**: saving anything in admin triggers `revalidateTag`, so changes appear within seconds with no redeploy. Draft **preview mode** lets you see unpublished items.

## 7. Admin Dashboard (`/admin`)

Look: the same brand but calmer. Navy sidebar with hex icons, dense and fast. Light and dark supported.

- **Overview:** unread messages, draft count, recent edits, simple traffic summary, and quick actions (New article, Upload work, Post log entry, Toggle availability).
- **Quick status bar:** one-click availability change from anywhere.
- **Projects:** create / edit / reorder (drag), choose tile size, mark featured, upload cover and gallery, rich text for the case study, live preview of how the hex tile looks.
- **Studio:** bulk upload dozens of files at once. Each file gets auto-detected size and ratio, then you add title, category, spec label and collection. Drag to reorder, bulk categorise, bulk delete.
- **Articles:** the writing suite (below).
- **Now:** edit current project, add build-log entries, change availability.
- **About:** profile, photo, bio, skills (drag between categories), experience, services, testimonials, CV upload.
- **Contact:** manage contact methods, read the message inbox, mark status, reply by email.
- **Media library:** everything uploaded, searchable, with alt text, usage tracking and safe delete.
- **Appearance and settings:** site text, nav labels, SEO defaults, social image, theme toggles, analytics IDs.
- **Security:** login with 2FA or passkey, session timeout, rate limits, audit log. This must not be skipped.

### Article writing suite

1. **Write:** Tiptap editor with slash commands (/h2, /code, /image, /callout, /quote, /embed, /table), autosave, word count, read time, and a split live-preview with the real public styling.
2. **Upload ready-made articles:** drag in a **.md / .mdx** file (front matter for title, tags, date is parsed), a **.docx** (converted with Mammoth), or paste HTML or Markdown. Images inside are automatically uploaded to Cloudinary and relinked. You review the import, then save as a draft.
3. **Metadata:** cover, excerpt, tags, series and part number, SEO title and description, canonical URL (for cross-posted articles), OG image (auto-generated if empty).
4. **Workflow:** Draft, Scheduled, Published. Version history (last 20 saves) and a one-click preview link.
5. **Export:** download any article as Markdown.

## 8. Things You Might Have Forgotten

Absolutely include:

- **SEO foundations:** unique titles and descriptions, **auto-generated OG images** per page (branded hex template), sitemap, robots, structured data (Person, Article, CreativeWork), canonical URLs.
- **RSS feed** for the Journal (developers love it).
- **Testimonials and client logos.** Social proof is what turns a pretty portfolio into clients.
- **Services and pricing clarity** plus the "Start a project" brief form. A portfolio's job is to get you hired.
- **CV download** and a printable one-page version.
- **Accessibility:** keyboard navigation for the hive, visible focus, alt text enforced in admin, ARIA for the radial menu and lightbox, colour contrast checks, reduced motion.
- **Mobile-first experience.** Every hover effect needs a tap equivalent. Test the hive on a small phone, because most of your audience will see it there.
- **Performance guardrails** for a heavy design: lazy-load animation, `content-visibility`, pause animations off-screen, cap simultaneous video previews, and use the poster image first.
- **Empty, loading and error states** that use brand elements (skeleton hexes).
- **Analytics** and an admin chart: which projects and articles get attention.
- **Backups and data export** (a button that downloads all content as JSON, plus DB backups).
- **Legal basics:** a short privacy note (the contact form stores personal data), cookie notice only if you use tracking cookies, copyright line, and a note that client work is shown with permission.
- **Client work permissions:** add a "confidential / blurred" flag on projects and Studio items.
- **Favicon and app icons:** export your Primary / Dark / Minimal icons as favicon, apple-touch, maskable PWA icons, and a web manifest.
- **Social and brand kit:** export the logo in SVG (light and dark), PNG, and a one-page brand guide. Your board's PNGs are raster, so **vectorise the logo** (SVG) before building. This is important for crisp scaling.
- **Newsletter capture** (optional): a simple subscribe box on the Journal, sent via Resend or Buttondown.
- **Open-source or live-demo links** for projects, plus a "tech decisions" note per case study.
- **Time zone and response time:** show Nairobi time and a clear "I reply within 24h" promise.
- **Domain, email and hosting:** a custom domain, a branded email address (hello@yourdomain), and DNS/SPF/DKIM so contact-form emails land in your inbox, not spam.
- **Error monitoring** (Sentry free tier) and uptime monitoring.

Nice to have later: i18n (English and Swahili), blog comments (or a reaction button), project "stack graph", a **"Hire me" PDF proposal generator**, a **dynamic OG image** for each article, and a sound toggle for subtle UI sounds (off by default).

## 9. Building It With Antigravity: The Plan

**Setup tips:**

- Save this document in the repo as `docs/BLUEPRINT.md`. Add a short rules file for the agent that says: *"Follow docs/BLUEPRINT.md. Pointy-top hexagons only. No gradients or blurred shadows. Montserrat + JetBrains Mono. All content comes from the database, never hardcoded. TypeScript strict. Server components by default. Respect reduced motion."*
- Build **one phase at a time**. Ask the agent to produce a plan first, review it, then let it execute. Test each phase in the browser before moving on, and commit after every phase.
- Give it the three images from your brand board as references, and the vectorised SVG logo once you have it.

| Phase | Goal | Done when |
| --- | --- | --- |
| **0. Foundation** | Next.js + TS + Tailwind + shadcn init, fonts, tokens, theme toggle with no flash, folder structure, env setup | Blank themed page with working dark and light |
| **1. Design system** | `lib/hex.ts`, `<Hex>`, `<HexGrid>`, chamfer frame, brand-element SVG set, restyled shadcn components, a hidden `/styleguide` page | Every component viewable in both themes |
| **2. Data and auth** | Database schema, migrations, seed data, admin auth with 2FA, protected `/admin` layout | You can log in and see an empty dashboard |
| **3. Media pipeline** | Cloudinary signed uploads, media library, dimension capture | Upload an image and a video, see them in the library |
| **4. Admin CRUD** | Settings, profile, availability, Now, skills, services, experience, contact methods, testimonials | Everything editable and persisted |
| **5. Projects + Studio admin** | Project editor with tile size, Studio bulk uploader, reorder, collections | Add 5 projects and 15 mixed-size works |
| **6. Journal admin** | Tiptap editor, .md/.docx import, drafts/scheduling, tags, series | Write one article and import another |
| **7. Public site: shell and Hive** | Loader, home honeycomb, radial menu, hex cursor, page transitions, command palette | Home feels exactly like the concept |
| **8. Public rooms** | Work (3 views + case study), Studio wall + lightbox, Journal, About, Now, Contact | All rooms driven by real data |
| **9. Polish and performance** | Motion tuning, reduced motion, accessibility, mobile pass, Lighthouse, full standalone installable PWA (@ducanh2912/next-pwa, manifest, icons, offline/service worker) | Performance budget met, PWA installable |
| **10. SEO, launch** | OG images, sitemap, RSS, analytics, error monitoring, domain, email, backups | Live and indexed |

**Prompt template for each phase:**

> Read `docs/BLUEPRINT.md`. We are on **Phase N: \[name\]**. Goal: \[goal\]. First write a short implementation plan and list the files you will create or change. Wait for my approval. Then build it, run it, and verify in the browser against the design principles (pointy-top hexes, solid colours only, no hardcoded content, both themes). List anything you could not finish.

## 10. Assumptions and Open Questions

I made these choices so you can start immediately. Tell me which to change:

1. **Secondary font:** I added JetBrains Mono for labels and code. Keep one family (Montserrat) only if you prefer.
2. **Rooms:** six rooms (Work, Studio, Journal, About, Now, Contact) to match the six sides of a hex. Services live inside About.
3. **Database:** PostgreSQL (Neon or Supabase). If you prefer MongoDB or Firebase, the model above still applies.
4. **Admin:** single user (you). No public sign-up.
5. **Hero line:** "Ideas. Code. Impact." from your board, editable in admin.
6. **Pricing:** shown as "from" ranges per service. You can hide it with one toggle.
7. **Vector logo:** I assume you can get an SVG of the logo made (a designer or auto-trace plus clean-up), as the portfolio depends on it.
8. **Imagery:** the hive depends on a strong hex-cropped photo of you. A confident, well-lit portrait with a plain background works best.

A useful first step: tell me which two or three projects you would feature first. I can then draft a sample case study and Studio entries so the build is tested with real content.
