---
name: complete-test-run
description: >-
  Runs the portfolio repo’s full local validation, defaulting to the full audit
  (CI gate, Lighthouse, SEO, interaction matrix, perf-data snapshot). Use when
  the user asks for a complete test run, full tests, run all tests, pre-release
  validation, test everything, thorough audit, or CI parity plus performance.
---

# Complete test run

Do **not** delegate to a subagent. Do **not** run long audits in Cursor’s integrated terminal — the user monitors progress in a **separate OS terminal window**.

Stop on first failure unless the user asked to continue or passed `--continue-on-fail` to the audit.

## Where to run

After pre-flight, start the audit command in a **new external terminal** (repo root). Keep that window open (`-NoExit` / equivalent) so exit codes and errors remain visible.

| OS | Launch (adjust path if needed) |
|----|--------------------------------|
| **Windows (PowerShell)** | `Start-Process powershell -WorkingDirectory 'c:\xampp\htdocs' -ArgumentList '-NoExit','-Command','Remove-Item Env:PLAYWRIGHT_BROWSERS_PATH -ErrorAction SilentlyContinue; npm run rm-assets; npm run audit'` |
| **macOS** | `osascript -e 'tell application "Terminal" to do script "cd \"'"$(pwd)"'\" && npm run rm-assets && npm run audit"'` |
| **Linux** | Prefer the user’s default terminal, e.g. `gnome-terminal -- bash -lc 'cd ... && npm run rm-assets && npm run audit; exec bash'` |

For **quick** one-liners (`test:fast`, `test:content` only), the integrated terminal is fine. Full `npm run audit` and `npm run test:complete` always use an external window.

The agent may run **pre-flight only** in the integrated shell (`node -v`, asset sync check, Docker). Once the external window is started, tell the user which command is running and where artifacts will appear; do not block the agent session waiting for the full audit unless the user explicitly asks you to wait and summarize when done.

## Pre-flight

1. **Node** ≥ 22.12.0 (`node -v`). If wrong, tell the user to switch Node and run `npm ci`.
2. **Dependencies** — if `node_modules` is missing or stale: `npm ci`.
3. **Assets** — before any build, run `npm run rm-assets` (Astro `rm-assets` integration generates gitignored `public/assets/` from tracked `assets/` masters).
4. **Playwright** — full audit needs **chromium + webkit** on the host (iPad/iPhone interaction profiles); CI/E2E only install chromium. Preflight auto-downloads any missing browsers before smoke launch. If install still fails, run `npm run playwright:install` once, then retry the audit.
5. **Docker Desktop** — required for **full** audit (CPU/RAM-limited profiles). If Docker is not running, tell the user before starting; do not substitute a partial audit unless they ask for quick/CI-only.

## Default — full audit

**When the user says “complete test run” (or similar) without qualifiers, run:**

```bash
npm run audit
```

This is `--level full` with all stages:

| Stage | What it runs |
|-------|----------------|
| **ci-gate** | `npm run test:all` then `npm run test:perf` (check, unit, content, build, verify, E2E, scroll `@perf`) |
| **docker-smoke** | One Docker container probe on `/` (local + interaction stage); fails before Lighthouse |
| **lighthouse** | Mobile + desktop presets, all pages, medians → `perf-data` snapshot |
| **seo** | Static SEO rules (report-only) + link crawl |
| **interaction** | Emulated device matrix (host + Docker profiles) |

- **Build** is produced by the CI gate inside the audit; still run asset sync in pre-flight first.
- Stale Astro preview lock: `npx astro preview stop`, then retry.
- **Clean stop:** in the external audit window, press **`q`** to write an `aborted` snapshot (press **`q`** again to force quit without snapshot). Closing the window usually skips the snapshot.
- After success: mention `npm run audit:compare` and `npm run audit:report`; latest artifacts under `.perf-data/runs/`. Only a **complete successful full** audit updates **`perf-data`** (`dev` + slim `snapshot/latest/`; local `raw/` stays uncommitted). Details: [docs/AUDIT.md](../../../docs/AUDIT.md).

## Faster variants (user narrows scope)

| User intent | Run |
|-------------|-----|
| Quick audit (no CI gate inside audit, shorter matrix) | `npm run audit:quick` — run `npm run test:complete` first if they still need CI parity |
| CI + scroll perf only (no Lighthouse / interaction / Docker) | `npm run test:complete` |
| Content / markdown only | `npm run test:content && npm run build && npm run test:verify` |
| Fast loop (no E2E) | `npm run test:fast && npm run build && npm run test:verify` |
| Prod URL audit | `npm run audit -- --target prod` (after user confirms) |
| Single audit stage | `npm run audit -- --stages lighthouse,seo` (etc.) |

## Reporting

When finished (or stopped on failure), summarize:

1. Which command(s) ran and exit codes.
2. First failing stage/command and the **actionable** line (Vitest file:line, validate-content JSON, Playwright test name, audit stage/profile).
3. Paths: `playwright-report/` for E2E; `.perf-data/runs/<latest>/` for audit (`summary.json`, `report.html`).

Do not commit or push unless the user asked. Link work to Trello only when committing with their card refs.

## Related docs

- [AGENTS.md](../../../AGENTS.md) — testing overview
- [docs/AUDIT.md](../../../docs/AUDIT.md) — audit flags and profiles
