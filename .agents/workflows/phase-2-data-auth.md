# Phase 2: Data and auth

Database schema, seed data, admin authentication.

Read: blueprint sections 6.3, 7 (Security).

## Tasks
1. Set up PostgreSQL with Drizzle. Create the full schema from blueprint 6.3 (all entities), migrations, and a seed script with realistic placeholder content marked as placeholder.
2. Admin auth (single user): Better Auth or Auth.js, email + passkey or 2FA, secure cookies, session timeout. Protect `/admin` in the layout AND in every server action.
3. Admin shell: sidebar with hex icons, header, empty dashboard, light/dark.
4. Audit log table and helper.

## Done when
- You can log in, see an empty admin dashboard, and unauthenticated requests to admin routes and actions are rejected.

## Finish (always)
1. Run `/verify` and fix every failure.
2. Update `docs/PROGRESS.md`: tick this phase, set the next current phase, append decisions and open issues.
3. Reply with a 5-line summary and what the user should test in the browser. Stop. Do not start the next phase.
