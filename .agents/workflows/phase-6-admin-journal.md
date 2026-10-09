# Phase 6: Journal admin

Article writing and import suite.

Use the skill `add-admin-module`. Read: blueprint sections 4.4, 7 (Article writing suite).

## Tasks
1. Tiptap editor with slash commands (h2, code, image, callout, quote, embed, table), autosave, word count, read time, live preview using public article styles.
2. Import: `.md`/`.mdx` (front matter), `.docx` (Mammoth), pasted HTML/Markdown. Images inside are uploaded to Cloudinary and relinked. Review step before saving as draft.
3. Metadata: cover, excerpt, tags, series + part, SEO, canonical URL. Status draft/scheduled/published, version history (last 20), preview link, Markdown export.
4. Unit-test the importers.

## Done when
- One article written in the editor and one imported from `.md` and `.docx` each, saved as drafts and published.

## Finish (always)
1. Run `/verify` and fix every failure.
2. Update `docs/PROGRESS.md`: tick this phase, set the next current phase, append decisions and open issues.
3. Reply with a 5-line summary and what the user should test in the browser. Stop. Do not start the next phase.
