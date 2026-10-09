# Phase 7: Public shell and Hive home

Global experience and the home page.

Read: blueprint sections 1, 4.1, 4.8, 5. Content comes from the database.

## Tasks
1. Global layout: top bar (logo, availability dot, theme, menu), radial hex menu, command palette (Cmd/Ctrl+K), footer with live Nairobi clock.
2. Hex cursor (desktop only), logo-assembly loader (first visit only), hex-tile page transitions.
3. Home "Hive": centre photo cell, six room cells with live micro-previews, stats computed from the database. Mobile: the 7-hex flower layout, tap to enter, no hover dependency.
4. Respect reduced motion; lazy-load heavy animation.

## Done when
- Home feels like the concept on desktop and phone, and navigates to the six rooms (pages may be stubs).

## Finish (always)
1. Run `/verify` and fix every failure.
2. Update `docs/PROGRESS.md`: tick this phase, set the next current phase, append decisions and open issues.
3. Reply with a 5-line summary and what the user should test in the browser. Stop. Do not start the next phase.
