---
name: add-admin-module
description: Recipe for adding a new admin-managed content type (table, validation, CRUD UI, public read). Use whenever a phase says to add an admin section.
---

# Add an admin module

1. **Schema** in `lib/db/schema/<entity>.ts` with `id`, `order`, `published`, `created_at`, `updated_at`. Generate and apply the migration. Add seed rows via the seed script.
2. **Zod schema** in `lib/validators/<entity>.ts` (shared by form and server action).
3. **Queries** in `lib/db/<entity>.ts`: `listPublished()`, `listAll()`, `getById()`, plus tagged caching (`<entity>` tag).
4. **Server actions** in `app/admin/<entity>/actions.ts`: create, update, delete, reorder, togglePublished. Each checks the session, validates with Zod, calls `revalidateTag('<entity>')`.
5. **Admin UI** in `app/admin/<entity>/`: list page with `DataTable` + drag-reorder + published toggle; create/edit page with the form; media fields use `MediaPicker`. Reuse existing admin components; add a new one only if none fits.
6. **Public read:** expose via the query function. Do not build the public page unless the current phase says so.
7. **Check:** unauthenticated access is rejected; validation errors show; empty state renders; `/verify` passes.
