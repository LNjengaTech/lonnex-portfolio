# Verify

Quality gate used at the end of every phase.

## Steps
1. `npm run lint` and `npm run typecheck`; fix errors.
2. `npm run check:tokens` and `npm run check:versions`; fix violations (never edit the scripts to silence them).
3. `npm run build`; fix errors.
4. `npm test` (Vitest) if tests exist for this phase's logic.
5. Start the dev server and check in the browser: both themes (light and dark), a phone-width viewport, no console errors. Admin pages reject unauthenticated access.
6. Report pass/fail per step in one short list.
