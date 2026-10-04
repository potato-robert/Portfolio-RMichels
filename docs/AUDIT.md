# Local performance & quality audit (`npm run audit`)

The audit utility is **local-only** — it is not part of CI deploy gates. It runs after a production build (for local targets) and stores each run as a snapshot on the orphan `perf-data` git branch (worktree at `.perf-data/`, gitignored in the main tree).

## Commands

| Script | Purpose |
|--------|---------|
| `npm run audit` | Full level: CI gate, Lighthouse, SEO, interaction matrix (+ Docker profiles when Docker is available) |
| `npm run audit:quick` | Quick level: skips CI gate; 3 Lighthouse runs; 3 host interaction profiles; no linkinator crawl |
| `npm run audit:compare [runA] [runB]` | Diff two snapshots (defaults: previous vs latest on same host fingerprint) |
| `npm run audit:report` | Writes `.perf-data/index.html` trend dashboard |
| `npm run audit:docker:build` | Build `portfolio-audit-playwright` image (Playwright version from lockfile) |
| `npm run audit:interaction:smoke` | Interaction only on `/` and `/projects` (no CI gate; needs `dist/`) |

### Common flags

```bash
npm run audit -- --target local|prod --level quick|full --stages ci-gate,lighthouse,seo,interaction
npm run audit -- --pages /,/about --profiles desktop-full-hd,budget-laptop-minimal
npm run audit -- --continue-on-fail --label before-refactor
npm run audit -- --skip-ci-gate   # used by audit:quick
npm run audit -- --skip-preflight # escape hatch only; not recommended
```

- **`--target local`**: reads built HTML from `dist/` for SEO; starts `astro preview` on `127.0.0.1:4321` only for Lighthouse and interaction (`--force` if a stale Astro lock exists). Requires `dist/` from `npm run build`. SEO canonical checks compare against production URLs (built HTML always canonicalizes to `https://rmichels.com`).
- **`--target prod`**: hits `https://rmichels.com` and skips in-development routes.

## Preflight

Every audit run starts with **preflight** (unless `--skip-preflight`):

- Node.js ≥ 22.12.0
- `dist/` when local SEO/Lighthouse/interaction runs **without** CI gate (`--skip-ci-gate`)
- Docker when Docker interaction profiles are included
- **Playwright smoke launch** for each host browser the run needs (Chromium for CI gate; Chromium + WebKit for full interaction). Fails in seconds instead of after Lighthouse.

Preflight **auto-downloads** any missing host browsers (Chromium and/or WebKit) before the smoke launch. E2E/CI only install Chromium; full audit interaction needs WebKit for iPad/iPhone profiles. If auto-install fails, run once manually:

```bash
npm run playwright:install
```

The audit clears Cursor’s sandbox `PLAYWRIGHT_BROWSERS_PATH` automatically (see `audit/lib/playwright-env-preload.mjs`).

## Stages

1. **CI gate** — `npm run test:all` and `npm run test:perf` (abort on failure unless `--continue-on-fail`).
2. **Lighthouse** — mobile + desktop presets, median of N runs, transfer bytes (including `.glb`), `benchmarkIndex`.
3. **SEO (report-only)** — static HTML rules + optional `linkinator` on full runs. Does not modify layouts; file follow-up Trello work from findings.
4. **Interaction** — Playwright profiles (CPU/network/WebGL spoofing, SwiftShader mode), scroll/mouse/idle scenarios, `?perf=1` plus optional `auditTier=` for deterministic tier matrix. Tier mismatches are **warnings**; exit code 1 only on hard failures (crash, timeout, Docker, launch). WebGL-heavy pages use an isolated browser per run; `webgl-heavy` routes wait for `load` instead of `networkidle`.

Long stages print **progress lines** to the terminal (CI gate heartbeats every 30s, per-page SEO, link crawl, Lighthouse runs, interaction profile/page counters, Docker build/run).

## Clean abort

In an interactive terminal (the dedicated PowerShell window for long audits), press **`q`** to stop after the current step and still write `summary.json` / `report.html` with status `aborted` and partial stage data. Press **`q`** again while stopping to exit immediately without a snapshot. **Closing the terminal window** kills the process and usually skips finalization — prefer **`q`**.

`Ctrl+C` follows the same two-step behavior when stdin is a TTY. Non-interactive runs (CI, piped stdin) only respond to signals.

## Profiles & Docker

- **Quick**: three Chromium host profiles (1080p desktop, Intel reduced tier, budget minimal tier).
- **Full**: ~10 host profiles (WebKit iPad/iPhone, Android, SwiftShader, etc.) plus **Docker** Chromium with `--cpus` / `--memory` limits against `host.docker.internal:4321`.

**Windows**: install [Docker Desktop with WSL2](https://docs.docker.com/desktop/setup/install/windows-install/). If Docker is missing on a **full** run that includes Docker profiles, the audit exits with an explicit error.

## Emulation limits

- CPU and network throttling use Chromium CDP only (WebKit profiles skip CDP emulation and note that in results).
- RAM and GPU are not truly limited on the host except via Docker cgroups and SwiftShader; `navigator.hardwareConcurrency`, `deviceMemory`, and WebGL renderer string can be overridden for tier testing.

## Snapshots

Each run creates `.perf-data/runs/<timestamp>_<sha>_<level>_<label>/` with `manifest.json`, `summary.json`, `report.html`, and `raw/` (gzipped Lighthouse JSON when Lighthouse ran). **Failed runs still write** manifest/summary/report (status `failed`, `summary.failure` and preflight checks). One line per run is appended to `.perf-data/history.jsonl` and committed on `perf-data` (no Trello refs on those commits).

## Reading comparisons

`audit:compare` flags Lighthouse regressions when both relative and absolute thresholds are exceeded (see `audit/config/budgets.ts`). Warnings appear when host fingerprint or audit level differs between runs.
