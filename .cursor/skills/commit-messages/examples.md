# Conventional Commits — Examples

## Good subjects

```
feat(content): add tourguide case study with EN and DE routes
fix(e2e): correct gallery selector after layout change
fix(deploy): pull git-lfs assets in CI to restore production images
perf(scroll): add device capability checks before initializing WebGL
refactor(about): extract experience section into reusable components
ci: run tests on PR only and deploy on main merge
test: add scroll performance budget checks with Playwright
build(deps): upgrade astro to 5.x
docs: document agent verification loop in AGENTS.md
chore: remove legacy PHP entrypoints after Astro cutover
```

## Subject + body (bullets) + Trello footer

```
chore(cursor): add Trello workflow for agent commits

- Add trello-workflow skill and rule: link commits via Refs footers, post SHA comments on cards, and restrict description edits to Agent Notes.
- Extend commit-messages skill with required Trello steps.

Refs: Trello #128
```

```
fix(islands): restore footer particle waves after Lenis refactor

- Re-bind the scroll listener on init so Lenis updates the camera position used by the particle shader.

Refs: Trello #42
```

```
feat(i18n): sync German about page with updated English copy

- Align skills list and experience dates with the EN source.

Refs: Trello #55
```

## Breaking change

Subject shorthand:

```
feat(api)!: remove legacy PHP routing endpoints
```

Or footer (preferred when explanation is long):

```
refactor(build): switch output from PHP to static dist

- Remove server-side PHP routes; production serves only the Astro dist/ build.

BREAKING CHANGE: all server-side PHP routes are removed.
Production now serves only the Astro dist/ build.

Refs: Trello #10
```

## Multi-commit split scenarios

### Scenario A — refactor + feature (split)

Working copy: component extraction across 4 files **and** new glossary content.

```
# Commit 1
refactor(about): extract experience section into components

# Commit 2
feat(about): add glossary terms to about page
```

### Scenario B — feature + its tests (single commit)

Working copy: new filter island + Playwright spec that exercises it.

```
feat(islands): add client-side homepage project filter
```

One story — keep together unless the test file is large enough to warrant a separate `test:` commit for review clarity.

### Scenario C — unrelated fixes (split)

Working copy: E2E selector fix **and** broken deploy LFS pull.

```
# Commit 1
fix(e2e): correct gallery selector after layout change

# Commit 2
fix(deploy): pull git-lfs assets in CI
```

### Scenario D — content + i18n (split by locale scope)

Working copy: new EN case study markdown + DE translation + hero images.

```
# Commit 1
feat(content): add tourguide case study

# Commit 2
feat(i18n): add German tourguide case study translation
```

Or single commit when added atomically as one publishing action:

```
feat(content): publish tourguide case study in EN and DE
```

### Scenario E — small typo (single commit)

Working copy: one-line fix in `AGENTS.md`.

```
docs: fix typo in verification loop command
```

No need to split.

### Scenario F — partial file split

Working copy: `src/pages/about.astro` has both a refactor hunk and a new content hunk.

```bash
git add -p src/pages/about.astro   # stage only refactor hunks → commit 1
git add -p src/pages/about.astro   # stage remaining hunks   → commit 2
```

## Type selection

| Change | Type | Example |
|--------|------|---------|
| New case study page | `feat` | `feat(content): publish tourguide case study` |
| Broken image on live site | `fix` | `fix(deploy): restore missing LFS assets in CI` |
| README / AGENTS.md edit | `docs` | `docs: add case study authoring guide` |
| Prettier / lint formatting | `style` | `style: format island modules` |
| Extract component, same UI | `refactor` | `refactor(about): split page into components` |
| Faster image loading | `perf` | `perf(images): lazy-load gallery with LQIP swap` |
| New Vitest file | `test` | `test: add content validation for project slugs` |
| Vite / Astro config | `build` | `build: enable inline stylesheets auto` |
| GitHub Actions workflow | `ci` | `ci: add playwright job to PR pipeline` |
| Bump lockfile | `chore` | `chore(deps): update three.js to r170` |

## Anti-patterns

| Avoid | Prefer |
|-------|--------|
| `git add .` with unrelated changes | Stage per group; verify with `git diff --cached` |
| One commit for 5 unrelated files | Plan and split by type/scope |
| `Fixed bug` | `fix(e2e): correct homepage filter selector` |
| `feat: Add new page.` | `feat(content): add tourguide case study` |
| `update stuff` | `chore(ci): simplify deploy workflow` |
| `WIP` | Split work; commit only the finished slice |
| `fix: typo and also refactor CI` | Two commits: `docs:` + `ci:` |
| `FEAT: BIG CHANGE` | `feat!: remove legacy PHP stack` |
| Planning 4 commits, running `git commit` once | Commit after each group; check `git status` between |

## PR message (after commits)

Always suggest this when finishing a commit session. Title goes in GitHub's title field; body is copy-paste markdown.

**Title:** `WebGL refactor, content pipeline, and layout polish`

````markdown
## Summary

- Render gist embeds as static Shiki code blocks at build time; fix project page HTML from markdown blank lines; add gallery alt text and refine team metadata
- Extract shared WebGL modules with performance tiers; update architecture docs
- Refactor content validation around a shared schema; run check/tests before deploy
- Fix landing model overflow and responsive see-more button; reset project tile parallax on breakpoint change
````

### PR message anti-patterns

| Avoid | Prefer |
|-------|--------|
| One bullet per commit (16 bullets for 16 commits) | Group by theme (3–7 bullets) |
| `## Test plan` section | Summary only |
| Repeating full commit hashes/subjects | Plain-language grouped summary |
| Title: `fix: stuff` | Title: `WebGL refactor, content pipeline, and layout polish` |
| Prose paragraph instead of bullets | `## Summary` with `-` bullets |
