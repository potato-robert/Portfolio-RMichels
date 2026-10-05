# Local performance & quality audit (`npm run audit`)

The audit utility is **local-only** — it is not part of CI deploy gates. It runs after a production build (for local targets). Full runs and Lighthouse `raw/` JSON live under `.perf-data/runs/` (gitignored). The optional **`perf-data` branch** (linked worktree at `.perf-data/`) stays **anchored to `dev`** and stores only the latest successful **full** audit as `snapshot/latest/` (no raw files).

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
npm run audit -- --all-pages   # every built route (slow; pre-default behavior)
npm run audit -- --pages /,/about --profiles desktop-full-hd,budget-laptop-minimal
npm run audit -- --continue-on-fail --label before-refactor
npm run audit -- --trace          # gzip Playwright traces under runs/<id>/raw/
npm run audit -- --skip-ci-gate   # used by audit:quick
npm run audit -- --skip-preflight # escape hatch only; not recommended
npm run audit -- --interaction-job-timeout-ms 180000   # per profile×page wall clock (default 240s; WebKit webgl-heavy 180s)
npm run audit -- --interaction-full-scenarios          # disable WebKit stability trims (warm reload, mouse sweep, shorter idle)
```

**npm `devdir` warning:** If npm prints `Unknown env config "devdir"`, it comes from a **user-level** npm config (`npm config get devdir` or `~/.npmrc`), not this repo. Remove or fix that setting locally; the audit does not set `devdir`.

- **`--target local`**: reads built HTML from `dist/` for SEO; starts `astro preview` on `127.0.0.1:4321` only for Lighthouse and interaction (`--force` if a stale Astro lock exists). Requires `dist/` from `npm run build`. SEO canonical checks compare against production URLs (built HTML always canonicalizes to `https://rmichels.com`).
- **`--target prod`**: hits `https://rmichels.com` and skips in-development routes.
- **Default page set** (when neither `--pages` nor `--all-pages`): EN `main` routes (`/`, `/about`, `/projects`, `/futureEarth`, `/tourguide`), EN sample `/clirioScanViews`, DE shell (`/de`, `/de/about`, `/de/projects`), and one DE case study (`/de/clirioScanViews`). German case studies otherwise mirror English; auditing every `/de/{slug}` is usually redundant.

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
2. **Docker smoke** (local full runs with interaction only) — after CI gate, one container probe on `/` using the same image and script as the interaction stage (`docker-2cpu-2gb` when present). Fails before Lighthouse if the container cannot reach `host.docker.internal:4321` or the tier probe fails.
3. **Lighthouse** — Lighthouse’s own **mobile** and **desktop** configs (correct throttling + user agent), optional **`mobile-lowend`** on full runs (3G-class + 6× CPU). Median of N runs; `summary.json` adds LCP element/phases, image/unused-JS opportunities, failed SEO/a11y/BP audit IDs, top requests, and per-run `benchmarkIndex`.
4. **SEO (report-only)** — static HTML rules + optional `linkinator` on full runs. Does not modify layouts; file follow-up Trello work from findings.
5. **Interaction** — Playwright profiles (CPU/network/WebGL spoofing, SwiftShader mode), **~5s wheel scroll** with warm-up (Lenis path on Chromium), FPS/dropped %/p99, LoAF script attribution, CDP `Performance.getMetrics` deltas, INP + click scenarios (menu, projects filter, lightbox). Optional **`--trace`** writes gzipped traces to `raw/`. Docker profiles run the same scroll scenario inside the container and return structured JSON metrics. Tier mismatches are **warnings**; exit code 1 only on hard failures (crash, timeout, Docker, launch). WebGL-heavy pages use an isolated browser per run; `webgl-heavy` routes wait for `load` instead of `networkidle`.

Long stages print **progress lines** to the terminal (CI gate heartbeats every 30s, per-page SEO, link crawl, Lighthouse runs, interaction profile/page counters, Docker build/run).

## Clean abort

In an interactive terminal (the dedicated PowerShell window for long audits), press **`q`** to stop after the current step and still write `summary.json` / `report.html` with status `aborted` and partial stage data. Press **`q`** again while stopping to exit immediately without a snapshot. **Closing the terminal window** kills the process and usually skips finalization — prefer **`q`**.

`Ctrl+C` follows the same two-step behavior when stdin is a TTY. Non-interactive runs (CI, piped stdin) only respond to signals.

## Profiles & Docker

- **Quick**: three Chromium host profiles (1080p desktop, Intel reduced tier, budget minimal tier).
- **Full**: host profiles include WebKit iPad/iPhone, Android, SwiftShader, **`4k-igpu-throttled`**, **`4k-swiftshader`**, **`retina-laptop-lowpower`**, **`tablet-chromium`**, **`desktop-full-hd-slow4g`**, plus **Docker** Chromium with `--cpus` / `--memory` limits against `host.docker.internal:4321`.

**Windows**: install [Docker Desktop with WSL2](https://docs.docker.com/desktop/setup/install/windows-install/). If Docker is missing on a **full** run that includes Docker profiles, the audit exits with an explicit error.

Containers use `Host: host.docker.internal`. Vite preview must allow that host (`vite.preview.allowedHosts` in `astro.config.mjs`). If an old preview is already bound to port 4321 without that setting, run `npx astro preview stop` before `npm run audit` so the audit can start a fresh preview.

Docker interaction probes load the same URLs as host Playwright (`?perf=1` and optional `auditTier=` from `AUDIT_TIER`, see `audit/lib/interaction-url.ts`). After navigation, the container script waits up to 30s for `body[data-perf-tier]` to reflect a real tier (`full` / `reduced` / `minimal`, matching `auditTier` when set) instead of reading the attribute before client `syncPerfTierToDocument` runs. Tier wait timeouts fail the Docker run (non-zero exit); they are not exercised in CI unless Docker profiles run locally.

## Emulation limits

- CPU and network throttling use Chromium CDP only (WebKit profiles skip CDP emulation and note that in results).
- RAM and GPU are not truly limited on the host except via Docker cgroups and SwiftShader; `navigator.hardwareConcurrency`, `deviceMemory`, and WebGL renderer string can be overridden for tier testing.

## Snapshots

Each run creates **local-only** folders under `.perf-data/runs/<timestamp>_<sha>_<level>_<label>/` with `manifest.json`, `summary.json`, `report.html`, and `raw/` (gzipped Lighthouse JSON when Lighthouse ran). That tree is **gitignored** inside the `.perf-data` worktree (`runs/`, `history.jsonl`, `index.html`). Failed or aborted runs still write those files locally; one line per finalized run is appended to **`history.jsonl`** (also local-only).

The **`perf-data` branch** is reset to the current **`dev` tip**, then receives **one commit** that only adds or updates **`snapshot/latest/`** (same tree as `dev` plus slim snapshot files — no “delete entire repo” diff). Local `runs/` and Lighthouse `raw/` stay in the worktree via **`.git/info/exclude`**, not committed.

## Interaction stability (WebGL)

- **`webgl-heavy`** routes use an **isolated browser** per interaction profile (`pageNeedsIsolatedBrowser` in `audit/lib/interaction-job-timeout.ts`) so a GPU crash on one case study does not poison the next page.
- Each host **profile×page** run has a **wall-clock budget** (default **240s**, **180s** for WebKit on webgl-heavy pages). Overruns record `failureKind: timeout`, force-close the browser context, and continue the matrix. Step lines like `Interaction ipad-webkit /tourguide: scroll` show where time was spent.
- **WebKit** profiles use **`expectedTier: minimal`** (`auditTier` in URLs) so case-study phone mockups use static fallbacks instead of GLB during audit. Stability trims (unless `--interaction-full-scenarios`): skip warm reload on WebKit webgl-heavy, skip mouse sweep, **2s** idle sample instead of 5s. **One retry** after timeout/crash on isolated webgl-heavy cells.
- Press **`q`** during interaction: abort tears down the active Playwright browser/context immediately (not only between cells).
- Host Chromium on **Windows with a discrete GPU** can still log `GPU process` / **WebGL context lost** under heavy WebGL; treat isolated hard failures as environment flake until they reproduce on a single page with `npm run audit:interaction:smoke` or `npm run audit -- --skip-ci-gate --stages interaction --profiles ipad-webkit --pages /tourguide`.
- Client islands dispose renderers and leave the shared animation loop on **context lost** (`ThreeMockup.ts`, `WebGLBackground.ts`) to reduce leak-driven crashes during long interaction matrices.
- **Docker** interaction `docker run` uses the same job timeout plus **30s** headroom (`spawnSync` timeout).

## Reading comparisons

`audit:compare` flags Lighthouse, **interaction scroll p95/FPS/INP**, byte totals, category scores, and SEO finding-count regressions when both relative and absolute thresholds are exceeded (see `audit/config/budgets.ts`). `audit:report` builds table-based `report.html` per run and SVG trend sparklines in `.perf-data/index.html` (grouped by host fingerprint). Warnings appear when host fingerprint or audit level differs between runs.
