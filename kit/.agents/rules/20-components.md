# Component and code conventions (always on)

## Structure
```
app/(site)/...            public pages (compose components only)
app/admin/...             protected admin
components/hex/           Hex, HexGrid, ChamferFrame, brand-element SVGs
components/ui/            shadcn (customised to the tokens)
components/site/          public composites (ProjectHex, StudioWall, ArticleBody...)
components/admin/         admin composites (DataTable, MediaPicker, SortableList...)
lib/                      hex.ts, cloudinary.ts, db/, auth.ts, seo.ts, site-config.ts
scripts/                  check-tokens.mjs, check-versions.mjs
```

## Rules
- One component per file, PascalCase, typed props, no default styling hacks: variants via `cva`.
- Reuse shadcn primitives (Button, Input, Dialog, Tabs, Badge...) restyled once in `components/ui/`. Do not hand-roll a second button.
- Data access only in `lib/db/` query functions; pages call them. Public reads use tag-based caching; admin mutations call `revalidateTag`.
- Every list entity has `order`, `published`, `created_at`, `updated_at`.
- Media: store Cloudinary `public_id`, `width`, `height`, `format`, `resource_type`; render through one `<CloudImage>` / `<CloudVideo>` component using `f_auto,q_auto` and placeholders.
- Loading, empty and error states use brand skeleton hexes (a shared component).
- Naming: kebab-case files for non-components, camelCase variables, no abbreviations in exports.
- Tests: Vitest for `lib/` logic (hex packer, layout engine, importers); one Playwright smoke test per phase for critical flows.
