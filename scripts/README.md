# Scripts

| Script | Purpose |
|--------|---------|
| `validate-content.mjs` | Pre-build validation (`npm run test:content`) — assets, i18n keys, EN/DE parity |
| `verify-build.mjs` | Post-build route checks (`npm run test:verify`) |
| `run-rm-assets.mjs` | Build-time asset pipeline (`npm run rm-assets`) — also runs via `pretest:content` / Astro integration |
| *(removed)* | Scroll profiling → `npm run audit -- --stages interaction` (see `docs/AUDIT.md`) |
| `export-db-to-content.mjs` | **Deprecated** — see below |

## export-db-to-content.mjs (deprecated)

The Astro migration is complete. **Markdown collections are the source of truth:**

- `src/content/projects/` — EN frontmatter + body
- `src/content/projects-de/` — DE body (frontmatter duplicated from EN today)

This script no longer embeds project metadata. It only regenerates DE markdown bodies from existing EN files, applying gettext PO translations when `scripts/archive/messages.po` is present.

```bash
npm run deprecated:export-content   # optional; prefer editing markdown directly
```

Do not use this to add or change project metadata — edit the markdown files instead.
