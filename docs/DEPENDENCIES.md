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
**Command:** `npm audit fix` (no `--force`)  
**Result:** 14 reported → **5 remaining** (see below). Lockfile updated for transitive patches (e.g. `js-yaml`, `postcss`, `playwright`, `devalue`, `fast-uri`, `nanoid`, `smol-toml`, `svgo`).

## Remaining findings (post `npm audit fix`)

| Package | Severity | Exposure | Notes |
|---------|----------|----------|--------|
| **astro** (5.x, e.g. 5.18.2) | Critical | **Build / dev** | Advisories include SSR, server islands, and image pipeline issues. Static deploy reduces **live-site** SSR risk; build still uses Astro + sharp. **Fix:** major upgrade (audit suggests 7.3.5+)—separate epic, not this remediation batch. |
| **sharp** (via astro) | High | **Build / CI only** | Image optimization during `astro build`. Not shipped to visitors. Resolved when Astro line pulls a patched sharp. |
| **esbuild** (via astro) | Moderate | **Dev server** (Windows) | Arbitrary file read when running `npm run dev` on Windows. Not used in production static hosting. Patched esbuild arrives with Astro major bump. |
| **vitest** / **@vitest/mocker** | Moderate | **Dev / CI only** | Path traversal in mock redirect; affects `npm run test:unit` only. **Fix:** Vitest 4.x (`npm audit fix --force` would jump majors)—schedule with test suite review. |

### Production vs dev/CI (summary)

- **Visitor-facing prod:** Prebuilt HTML/CSS/JS in `dist/`. No Node server on Hostinger for the portfolio root.
- **Dev/CI:** Vitest, Playwright, Astro dev server, content validation scripts, GitHub Actions build.
- **Build-time prod artifact:** `astro build` (sharp, esbuild, Astro compiler)—treat as trusted CI/local environment; keep CI and laptops patched.

## Out of scope for blind `--force`

- **Astro 5 → 7:** breaking; run dedicated upgrade with full `test:fast`, `build`, `test:verify`, and `test:e2e`.
- **Vitest 3 → 4:** breaking; verify unit tests and config after bump.

Track major upgrades in a GitHub issue or project board when scheduled.
