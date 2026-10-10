# Phase 9: Polish and performance

Motion tuning, accessibility, mobile, Lighthouse.

Read: blueprint sections 5 and 8 (accessibility, performance).

## Tasks
Tune motion, enforce reduced motion, keyboard and screen-reader pass (hive, radial menu, lightbox), alt-text enforcement, empty/loading/error states, small-phone pass, bundle analysis and lazy-loading, Lighthouse mobile run. Fix findings; log anything deferred.

Just added this one: Make this a full standalone installable PWA. I have provide the PWA assets in the asset/pwa-assets folder in the project root. Use @ducanh2912/next-pwa

## Done when
- LCP under 2.5s on mobile 4G, home first-load JS about 250KB or less, no critical accessibility failures.

## Finish (always)
1. Run `/verify` and fix every failure.
2. Update `docs/PROGRESS.md`: tick this phase, set the next current phase, append decisions and open issues.
3. Reply with a 5-line summary and what the user should test in the browser. Stop. Do not start the next phase.
