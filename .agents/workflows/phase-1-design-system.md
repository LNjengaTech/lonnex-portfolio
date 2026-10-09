# Phase 1: Design system

Hex primitives, brand elements, restyled shadcn, styleguide.

Read: blueprint sections 3.3, 3.4, 3.5, 6.4.

## Tasks
1. `lib/hex.ts`: axial (q,r) to pixel, neighbours, and a honeycomb packer for 1x/2x/3x hexes. Unit-test it.
2. Components: `Hex`, `HexGrid`, `ChamferFrame`, `HexButton` (hex-capped), `HexChip`, `SkeletonHex`, `ThemeToggle` (final).
3. Brand-element SVG components (solid hex, outlined hex, slashed hex, triple cluster, logo mark, logo lockup) using `currentColor`. If no SVG logo exists, create a placeholder and note it in PROGRESS.
4. Restyle shadcn: Button, Input, Textarea, Select, Dialog, Sheet, Tabs, Badge, Switch, Tooltip, Toast, Table, Command, Skeleton.
5. Hidden `/styleguide` page showing every component in both themes.

## Done when
- Every component is visible on `/styleguide`, both themes, and uses only token classes.

## Finish (always)
1. Run `/verify` and fix every failure.
2. Update `docs/PROGRESS.md`: tick this phase, set the next current phase, append decisions and open issues.
3. Reply with a 5-line summary and what the user should test in the browser. Stop. Do not start the next phase.
