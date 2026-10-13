---
name: commit-perf-data-snapshot
description: >-
  After a successful full local audit, merge dev into perf-data and append one
  git commit for snapshot/latest. Use when the user confirms they want to commit
  the test log snapshot, publish perf-data, or save audit results to the perf-data
  branch.
---

# Commit perf-data snapshot

**Never** run this automatically at the end of `npm run audit`. Only run when the user **explicitly agrees** (e.g. after the complete-test-run skill asks).

## Prerequisites

1. A **successful full** local audit run under `.perf-data/runs/<runId>/` with all stages recorded in `summary.json` (`ci-gate`, `lighthouse`, `seo`, `interaction`).
2. **`perf-data` worktree** exists at `.perf-data/` (`git worktree list` shows `[perf-data]`).
3. Main repo branch **`dev`** reflects the app revision you intend to anchor (the run’s `gitSha` in `manifest.json` should match that intent; dirty working trees are ok if the user accepts the recorded sha).

## Steps

1. **Confirm run id** — default to the newest successful full run:
   - List: newest folder under `.perf-data/runs/` with `manifest.json` where `status === 'success'` and `level === 'full'`.
   - Or use the run id the user named from the audit summary.

2. **Show a one-line preview** from `.perf-data/runs/<runId>/summary.txt` (status, git sha, duration) before committing.

3. **Publish** from repo root (merges **`dev` into `perf-data`**, then commits **`snapshot/latest/`** only):

   ```bash
   npm run audit:publish-perf-data -- <runId>
   ```

   Omit `<runId>` to use the latest eligible run.

4. **Verify** in the `.perf-data` worktree:

   ```bash
   git -C .perf-data log --oneline -3
   git log dev..perf-data --oneline
   ```

   Expect a **merge commit** from `dev` when `dev` had moved ahead, plus a new **`audit: … snapshot`** commit. Older snapshot commits remain on the branch.

5. **Push** — only if the user asks. `perf-data` may need `git push origin perf-data` (force-with-lease only if they previously rewrote history; append model should fast-forward or add commits normally).

## Failures

| Symptom | Action |
|---------|--------|
| “not a complete successful full audit” | Do not commit; user needs `npm run audit` (full) success first. |
| Merge conflict in `.perf-data` | User resolves in `.perf-data`, completes merge commit, re-runs publish. |
| “snapshot unchanged” | Same run id republished with identical packed files; no new commit (ok). |

## Trello / git on `dev`

This skill commits **only on `perf-data`** in the `.perf-data` worktree. Do **not** commit application changes on `dev` unless the user separately asks (use commit-messages skill + Trello refs).

## Related

- [complete-test-run/SKILL.md](../complete-test-run/SKILL.md) — runs audit, then asks about this skill
- [docs/AUDIT.md](../../../docs/AUDIT.md) — snapshot layout and local `runs/`
