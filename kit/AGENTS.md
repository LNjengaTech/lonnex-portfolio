# Lonnex Njenga Portfolio

Next.js full-stack portfolio, hexagon-based brand ("The Hive"). Fully dynamic: every piece of content is managed from /admin.

## Read order (do this at the start of every session)
1. `docs/PROGRESS.md` (current phase, decisions, what is done)
2. `.agents/rules/*` (always-on rules)
3. Only the part of `docs/BLUEPRINT.md` that the current phase workflow names

## How we work
- One phase at a time, run via slash commands: `/next` or `/phase-N`.
- Never build ahead of the current phase. Never skip `/verify`.
- At the end of a phase: update `docs/PROGRESS.md`, summarise in 5 lines, stop.
- If sub-agents are spawned, pass them the rules in `.agents/rules/` explicitly.
