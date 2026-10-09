# Phase 3: Media pipeline

Cloudinary uploads and media library.

Read: blueprint section 6.5.

## Tasks
1. Signed-upload API route; client `MediaUploader` (drag and drop, multi-file, progress, cancel) for images and video.
2. Save `public_id`, width, height, format, resource_type, bytes, dominant colour, alt text to `media_assets`.
3. `CloudImage` and `CloudVideo` components (`f_auto,q_auto`, responsive srcset, placeholder, poster).
4. `MediaPicker` (modal library with search) and the admin Media Library page (alt text editing, usage, safe delete).

## Done when
- Upload one image and one video; both appear in the library and render through the components with correct ratios.

## Finish (always)
1. Run `/verify` and fix every failure.
2. Update `docs/PROGRESS.md`: tick this phase, set the next current phase, append decisions and open issues.
3. Reply with a 5-line summary and what the user should test in the browser. Stop. Do not start the next phase.
