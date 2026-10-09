# Phase 0: Foundation

Project scaffold, tokens, fonts, theme toggle.

Read: blueprint sections 3.1, 3.2, 6.1, 6.2.

## Tasks
1. Scaffold Next.js (App Router, TypeScript strict, Tailwind, ESLint) using the latest STABLE versions only. Check `npm view next dist-tags` first.
2. Copy `docs/starter/globals.css` to `app/globals.css`. Do not add colours anywhere else.
3. Load Montserrat and JetBrains Mono with `next/font`, exposing `--font-montserrat` and `--font-jetbrains`.
4. Theme: default to system preference, remember choice, no flash (inline head script setting `data-theme`). Build a `ThemeToggle` (hex-styled) placeholder.
5. Create the folder structure from `20-components.md`, `lib/site-config.ts`, and add package scripts: `lint`, `typecheck`, `check:tokens`, `check:versions`, `test`.
6. Initialise shadcn/ui against the tokens (radius 0). Add Vitest.
7. Create `.env.example` listing every env var needed later (DB, Cloudinary, auth, Resend).

## Done when
- A blank themed page renders in light and dark with correct fonts, no flash on reload.
- Changing `--brand-blue` in `globals.css` changes the whole page.

## Finish (always)
1. Run `/verify` and fix every failure.
2. Update `docs/PROGRESS.md`: tick this phase, set the next current phase, append decisions and open issues.
3. Reply with a 5-line summary and what the user should test in the browser. Stop. Do not start the next phase.
