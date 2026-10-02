# Dependencies and security audit

This site is a **static** Astro build (`output: static`). Most npm packages exist for **local dev**, **CI**, and **build-time** tooling—not for runtime on Hostinger.

## Routine maintenance

```bash
npm audit
npm audit fix          # non-breaking fixes only
# Do not run npm audit fix --force without a planned major upgrade (Astro, Vitest).
```

After dependency changes: `npm run test:fast && npm run build && npm run test:verify`.

GitHub **Dependabot alerts** (repo Security tab) still notify you of known CVEs in the lockfile; this repo does not use scheduled version-update PRs.

## Last planned audit pass

**Date:** 2026-10-01  
**Command:** Astro **6.4.8 → 7.3.5** (upgrade 3/3); explicit `@astrojs/markdown-remark` + `markdown.processor: unified()`; `compressHTML: true` (preserve v6 inline spacing). Verification on **Node v22.23.2** (local portable) and CI **Node 22**.  
**npm audit before (Astro 6.4.8):** 3 findings — **astro** (critical, transitive esbuild/sharp), **esbuild** (low), **sharp** (high).  
**npm audit after (Astro 7.3.5):** **0 vulnerabilities**.

**Resolved versions (lockfile):** `astro@7.3.5`, `@astrojs/markdown-remark@7.3.1`, `@astrojs/check@0.9.10`, `@astrojs/sitemap@3.7.4`, `vite@8.3.2` (via Astro).

## Node.js requirement

Astro 7 requires **Node ≥22.12.0** (`engines` on `astro` and `@astrojs/compiler-rs`). CI/deploy workflows use Node 22. Reinstall `node_modules` with Node 22+ after switching majors (rolldown native bindings are platform-sensitive).

## Remaining findings (post upgrade 3/3)

None from `npm audit` on 2026-10-01 after Astro 7.3.5.

Re-run `npm audit` after any future dependency bumps; transitive advisories can return before upstream patches land.

### Production vs dev/CI (summary)

- **Visitor-facing prod:** Prebuilt HTML/CSS/JS in `dist/`. No Node server on Hostinger for the portfolio root.
- **Dev/CI:** Vitest, Playwright, Astro dev server, content validation scripts, GitHub Actions build.
- **Build-time prod artifact:** `astro build` (sharp, esbuild, Astro compiler)—treat as trusted CI/local environment; keep CI and laptops on Node 22.12+.

## Out of scope for blind `--force`

- **Vitest 3 → 4:** done (4.1.11).
- **Astro 6 → 7:** done (7.3.5); full verification loop passed (`check`, `test:unit`, `test:content`, `build`, `test:verify`, `test:e2e`).

Track future major upgrades in a GitHub issue or project board when scheduled.
