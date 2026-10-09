# Core rules (always on)

## Project
Portfolio for Lonnex Njenga: web/cross-platform developer and commercial graphic designer (banners, fliers, cards, video ads, mockups). Public site + `/admin` dashboard. Stack: Next.js (App Router), TypeScript strict, Tailwind, customised shadcn/ui, lucide-react, PostgreSQL + Drizzle, Cloudinary, Tiptap, Shiki, Resend, Zod.

## Hard rules
1. **No hardcoded content.** Every text, image, link, number, skill, project, status shown on the public site comes from the database. Only UI chrome labels may live in code, and even nav labels come from `site_settings`.
2. **Stable versions only.** Use the latest STABLE release of every package and tool. Never install anything tagged alpha, beta, rc, next, canary, dev or experimental. Before adding a dependency, check its `latest` dist-tag on the npm registry (`npm view <pkg> dist-tags`) rather than trusting memory. Pin exact versions (`.npmrc` has `save-exact=true`). Use Node LTS. Commit the lockfile.
3. **Single source of truth.** Colours and fonts: only in `app/globals.css`. Site constants: `lib/site-config.ts`. Hex geometry: `components/hex/` and `lib/hex.ts`. Never duplicate.
4. **Components first.** If a UI pattern appears twice, it becomes a component. Pages compose components and contain almost no styling.
5. **Server components by default.** Add `"use client"` only for interactivity or animation. Validate all input with Zod. Mutations go through server actions with auth checks.
6. **Security.** Every `/admin` route and every mutation checks the session on the server. Never expose secrets to the client. Rate-limit public forms.
7. **Accessibility and motion.** Keyboard operable, visible focus, alt text required, `prefers-reduced-motion` respected.

## Process rules
- Work only on the current phase (see `docs/PROGRESS.md`). Do not scaffold future phases.
- Keep responses short. Do not re-read the whole blueprint; read only the sections the workflow names.
- Do not create extra documentation files. Update `docs/PROGRESS.md` only.
- When blocked or when a requirement is ambiguous, ask ONE concise question, then continue.
- Run `/verify` before declaring a phase done.
