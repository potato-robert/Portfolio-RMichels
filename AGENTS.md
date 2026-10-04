# Agent Guide — Portfolio-RMichels

Personal portfolio site for [rmichels.com](https://rmichels.com). **Astro** static site with content collections, bilingual routes (EN root / DE `/de/`), and client islands for Three.js and filtering.

## Stack

| Layer | Technology |
|-------|------------|
| Site generator | Astro 7 (static output) |
| Content | Markdown collections in `src/content/projects/` |
| Styles | Sass in `src/styles/` (Vite build) |
| Client JS | TypeScript islands in `src/islands/` |
| 3D | Three.js (per-page islands) |
| i18n | Locale-prefixed routes + `src/i18n/ui-*.json` |
| Deploy | GitHub Actions → SFTP upload (`dist/`) to Hostinger — see `docs/DEPLOY.md` |
| Local dev | `npm run dev` (port 4321) |

## Dev Tooling

```bash
npm install
npm run dev      # Astro dev server
npm run build    # Output to dist/
npm run check    # astro check
npm run test:unit      # Vitest (src/lib/*)
npm run test:content   # Content/asset/i18n validation
npm run test:verify    # Post-build dist/ route checks (run after build)
npm run test:e2e       # Playwright (after build)
```

- **Node.js ≥22.12.0** (matches CI; Astro 7 fails on Node 20). After switching Node major, run `npm ci` so native deps (e.g. Rolldown) match the runtime.
- Content export (dev helper): `npm run deprecated:export-content` — **deprecated**; syncs DE bodies from EN markdown with optional PO translations (see `scripts/README.md`)
- Commit `package-lock.json`; `node_modules/` is gitignored

## Directory Map

```
/
├── astro.config.mjs
├── package.json
├── public/
│   ├── assets/              # Images, icons, models (junction/copy from assets/)
│   ├── .htaccess            # Static hosting rules (copied to dist/)
│   └── css/normalize.css
├── src/
│   ├── content.config.ts    # Content Layer loaders + Zod schemas
│   ├── content/
│   │   ├── projects/        # EN case study frontmatter + body
│   │   └── projects-de/     # DE case study bodies (translated)
│   ├── i18n/ui-en.json, ui-de.json
│   ├── layouts/BaseLayout.astro, ProjectLayout.astro
│   ├── components/          # Header, Footer, ProjectTile, etc.
│   ├── islands/             # Client TS: Menu, Lenis, Three.js, filters
│   ├── lib/projects.ts, roles.ts, i18n.ts
│   ├── pages/               # EN routes
│   └── pages/de/            # DE routes
├── scripts/
│   ├── validate-content.mjs # npm run test:content
│   ├── verify-build.mjs
│   └── export-db-to-content.mjs  # deprecated — see scripts/README.md
├── subdomains/              # Manual deploy only (tourguide, etc.)
└── docs/
```

## Page Pattern

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
const locale = 'en';
---
<BaseLayout title="..." description="..." locale={locale} pageType="about">
  <!-- content -->
</BaseLayout>
```

## Case Study Pattern

1. Add `src/content/projects/{slug}.md` with frontmatter (`slug`, `name`, `projectType`, `roles`, etc.) and markdown body
2. Add hero `public/assets/img/{slug}.jpg` and gallery under `public/assets/img/{slug}/lqip/`
3. Astro generates `/slug` and `/de/slug` via `src/pages/[slug].astro`

## i18n

| Page | EN | DE |
|------|----|----|
| Home | `/` | `/de/` |
| About | `/about` | `/de/about` |
| Projects | `/projects` | `/de/projects` |
| Case study | `/futureEarth` | `/de/futureEarth` |

UI strings: `t('key', locale)` from `src/lib/i18n.ts`. Language toggle links to equivalent path (no session).

## URL Preservation

- Case study slugs use camelCase via `slug:` frontmatter (e.g. `futureEarth`); runtime slug comes from markdown filename via `getProjectSlug()` (see `docs/NEW_PROJECT_PAGE.md`).
- `tourguide` is published at `/tourguide` (beta on Google Play and web; `inDevelopment: false`). Product landing and legal pages live on `https://tourguide.rmichels.com/` (manual subdomain deploy).

## Homepage and projects filters

| Topic | Behavior |
|-------|----------|
| Session filter | `sessionStorage` key `rmVisitorFilter` stores the last `?filter=` value (comma-separated role slugs) for the browser tab. It persists when visiting `/` or `/projects` **without** a query string until the tab is closed. |
| OR semantics | Comma-separated filters match projects whose `roles` include **any** listed slug (OR), on **both** home and `/projects`. Server-side helpers in `src/lib/projects.ts` already use OR. |
| Home | `HomeFilter.ts`: `?filter=vr` writes session storage and hides non-matching tiles; reads session when no query. |
| Projects | `ProjectFilter.ts`: URL preselect and multi-select use OR semantics. |
| Links | Filter-aware nav links append `?filter=` from session storage when present. |

Quick check: `/?filter=vr,front-end` shows tiles with role `vr` **or** `front-end`.

## Privacy

- The Site sets **no HTTP cookies**. Analytics uses cookieless Umami (EU) on production only; visitors can opt out on the privacy policy page.
- Third-party iframes (YouTube, Sketchfab, Figma, Clirio Azure) are converted at build time to click-to-load placeholders via `src/lib/external-embeds.ts`. Unregistered iframe hosts **fail the build**.
- Gists are inlined at build time (`remark-gist-embed`); no GitHub requests on page view.

## Testing

After code changes, run the agent verification loop (fast tier, < 3 min):

```bash
npm run check && npm run test:unit && npm run test:content && npm run build && npm run test:verify
```

Before changes touching islands, filters, or i18n routing, also run:

```bash
npm run test:e2e
```

Content-only changes (new case study markdown + images):

```bash
npm run test:content && npm run build && npm run test:verify
```

**Single-command alias:** `npm run test:fast && npm run build && npm run test:verify` covers the common agent loop without E2E.

**Complete local run:** default is full audit — `npm run audit` (CI gate, Lighthouse, SEO, interaction, `perf-data` snapshot). CI-only shortcut: `npm run test:complete`. Agent workflow: `.cursor/skills/complete-test-run/SKILL.md`.

**Failure diagnostics:** Vitest reports file:line; `validate-content.mjs` emits `{ slug, field, error }` JSON lines; Playwright captures screenshots on failure in `playwright-report/`.

## Local audit (not CI)

Thorough load, SEO, and interaction audits: `npm run audit` / `npm run audit:quick`. Snapshots live on the `perf-data` branch worktree at `.perf-data/`. See **`docs/AUDIT.md`**.

## Deploy

- **PR → `main`:** CI runs full validation — `npm ci`, sync assets, `npm run check`, `npm run test:unit`, `npm run test:content`, `npm run build`, `npm run test:verify`, Playwright E2E
- **Merge to `main`:** deploy workflow runs `check`, `test:unit`, `test:content`, build, `test:verify`, then SFTP upload of `./dist/` (port 65002, `wlixcc/SFTP-Deploy-Action`)
- Deploy uploads to `/home/$HOSTINGER_SFTP_USERNAME/public_html` only; `public_html/subdomains/` is excluded and never bulk-deleted
- `subdomains/` are deployed manually via SFTP (not in CI); see `docs/DEPLOY.md`

## Trello (Portfolio SCRUM)

Work is tracked on the **Portfolio SCRUM** board via MCP (`project-0-htdocs-trello`). Credentials: `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID` in Cursor MCP env (not in git).

| Rule | Detail |
|------|--------|
| Card refs | `#127` = Trello `idShort`; use `#127: Card title` + bullet sub-tasks in **Agent Notes** |
| Commits | Footer `Refs: Trello #127`; after each commit, **comment** on each linked card with full SHA + subject |
| Descriptions | Agents edit **only** under `## Agent Notes`; never change text above that heading |

Skills: `.cursor/skills/trello-workflow/SKILL.md`, `.cursor/skills/commit-messages/SKILL.md`, `.cursor/skills/complete-test-run/SKILL.md`. Rule: `.cursor/rules/trello-workflow.mdc`.

## Never Edit or Commit

Same as before: `nopublicaccess/`, `database/`, `.cursor/mcp.json`, `_RawAssets/`, etc.

## Further Reading

- `docs/ARCHITECTURE.md` — Astro request/build flow
- `docs/DEPLOY.md` — Hostinger SFTP secrets and hPanel SSH key setup
- `docs/NEW_PROJECT_PAGE.md` — add a project via markdown
- `docs/AUDIT.md` — local `npm run audit` framework
