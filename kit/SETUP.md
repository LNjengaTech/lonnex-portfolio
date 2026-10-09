# Setup (5 minutes)

1. Create your project folder and copy everything from this kit into its root (keep the folder structure, including the hidden `.agents` folder).
2. Export the blueprint Doc as Markdown and save it as `docs/BLUEPRINT.md`.
3. Open the folder in Antigravity. In the Customizations panel, confirm the three rules appear under Workspace rules.
4. In the agent chat, type `/phase-0-foundation`. After it finishes, test in the browser, then type `/next` in a NEW conversation.
5. Add `check:tokens` and `check:versions` scripts to package.json if the agent has not already (Phase 0 does this).

Tips: keep one phase per conversation; if the agent drifts, say "re-read the rules"; commit to git after every phase.
