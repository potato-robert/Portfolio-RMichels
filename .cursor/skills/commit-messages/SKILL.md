---
name: commit-messages
description: >-
  Analyze the working copy, split changes into logical Conventional Commits
  when appropriate, commit them sequentially, link each commit to Trello cards,
  post Trello commit comments, and always suggest a copy-paste GitHub PR title
  and summary from origin/main..origin/dev (prose, themed ### sections, Trello
  Refs). Use when the user asks to commit, write commit messages, stage changes,
  review the working copy, or wants a PR summary.
---

# Commit Messages

Use **[Conventional Commits](https://www.conventionalcommits.org/)** — the de-facto standard used by Angular, semantic-release, and most open-source projects.

## Format

```
<type>[optional scope]: <description>

- <what changed or why, one bullet per logical slice>
- <another bullet if needed>

Refs: Trello #127[, Trello #140 …]
```

Canonical example:

```
chore(cursor): add Trello workflow for agent commits

- Add trello-workflow skill and rule: link commits via Refs footers, post SHA comments on cards, and restrict description edits to Agent Notes.
- Extend commit-messages skill with required Trello steps.

Refs: Trello #128
```

### Subject line

```
<type>[scope]: <description>
```

| Part | Rule |
|------|------|
| **type** | What kind of change (see table below) |
| **scope** | Optional noun in parentheses — the area affected (e.g. `i18n`, `ci`, `e2e`) |
| **description** | Imperative mood, lowercase, no trailing period, ≤ 72 chars |

### Types

| Type | When to use |
|------|-------------|
| `feat` | New user-facing capability or content |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace — no logic change |
| `refactor` | Code restructure with no behavior change |
| `perf` | Performance improvement |
| `test` | Add or update tests |
| `build` | Build system, bundler, or dependencies |
| `ci` | CI/CD pipeline or workflow changes |
| `chore` | Maintenance that doesn't fit above (tooling config, housekeeping) |
| `revert` | Revert a prior commit |

### Body (bullet list)

Separate from the subject with a **blank line**. Use **`-` bullets** (not paragraphs):

- **One bullet per logical slice** of the commit (file group, behavior, or outcome)
- Each bullet is a **full sentence** or clear phrase; capitalize the first word; end with a period when it reads as a sentence
- Cover **what changed** and, when useful, **why** — do not repeat the subject line verbatim
- Wrap long bullets at ~72 characters when practical
- Omit the body only when the subject fully describes a **single-file / trivial** change; still include the Trello footer

For breaking changes, add a `BREAKING CHANGE:` footer **above** `Refs:` (prose is ok there).

### Footer

```
BREAKING CHANGE: <description of what broke and how to migrate>
Refs: Trello #127, Trello #140
```

- **`Refs: Trello #<idShort>` is required on every commit** — one or more Portfolio SCRUM cards (see `.cursor/skills/trello-workflow/SKILL.md`). Ask the user for card numbers if missing.
- `BREAKING CHANGE` (or `type!:` in the subject, e.g. `feat!:`) signals a major-version bump
- GitHub issue refs may appear **after** Trello refs on the same `Refs:` line if needed

## Writing rules

1. **One logical change per commit** — each commit should build and make sense on its own.
2. **Subject = what + where** — `fix(e2e): correct gallery selector after layout change`
3. **Body = `-` bullets** — one line per slice; skip only for trivial single-purpose commits.
4. **Scope is optional but encouraged** when it aids navigation in `git log`.
5. **Never commit secrets** — exclude `nopublicaccess/`, credentials, `.env`, and similar paths.

### Suggested scopes for this repo

| Scope | Area |
|-------|------|
| `content` | Markdown case studies, frontmatter, assets |
| `i18n` | DE/EN routes, `ui-*.json`, translations |
| `ci` | GitHub Actions workflows |
| `e2e` | Playwright tests |
| `islands` | Client-side TypeScript islands |
| `styles` | Sass / CSS |
| `deploy` | SFTP/Hostinger, hosting, `.htaccess` |
| `deps` | `package.json` / lockfile updates |

Omit scope when the change is repo-wide or doesn't fit a single area.

## Split or single commit?

**Default: analyze the full working copy first.** Do not blindly commit everything in one shot — and **do not over-split**. Most agent sessions on this repo should land as **one commit**, or **two** when there is a clear second story (e.g. unrelated CI fix).

### Target commit count

| Situation | Typical commits |
|-----------|-----------------|
| One feature, fix, or content slice (incl. styles, tests, i18n, verify-build for that slice) | **1** |
| Feature + unrelated housekeeping (e.g. `feat` + `chore(cursor)` skill tweak) | **2** |
| Unrelated changes the user asked to split (e.g. privacy work + new case study) | **2–3**, rarely more |

**Avoid** slicing the same user story into many commits by layer (`ui` → `lib` → `islands` → `style` → `test`). That makes review and PR noise worse without helping bisect.

### Keep a single commit when

- All changes serve **one story** (e.g. a bug fix and its regression test, or a feature with its styles and E2E)
- The diff is **small and atomic** (typo, config tweak, single-file change)
- Splitting would leave **intermediate commits broken** (feature without its required companion change in the same push)
- Changes are **tightly coupled** — separating them obscures intent more than it helps review
- The user asked to **commit** without asking to **split** — default to **one** commit unless the working copy has obvious unrelated hunks

### Split into multiple commits when

- Changes span **unrelated stories** (privacy page + unrelated case study + CI workflow)
- Changes span **different types** that are genuinely independent (`feat` + unrelated `ci` deploy fix)
- A **large refactor** on shared infrastructure must land before a separate feature that depends on it **and** reviewers need that refactor isolated
- **Generated or bulk files** (lockfile, `dist/`) should be separate from source changes — or excluded entirely unless intentional
- Reverting one slice without the other must stay easy **and** the slices are independent stories

When splitting, **commit sequentially** — finish and verify each commit before starting the next. Cap planned splits at **three commits** unless the user explicitly wants finer granularity.

### Over-splitting (avoid)

- Do **not** commit shared UI, lib helpers, islands, Sass, and E2E as separate commits when they ship one feature together.
- Do **not** split EN/DE routes, matching copy, and styles for the same page into separate commits.
- Do **not** treat `style` or `test` as mandatory separate commits when they belong to the same story — fold them into the `feat` or `fix` commit.

### Grouping guide

| Group together | Split apart |
|----------------|-------------|
| Feature + tests for that feature | Feature + unrelated CI workflow change |
| EN content + matching DE translation | Content update + stylesheet refactor |
| Bug fix + minimal fix to the test that caught it | Two unrelated bug fixes |
| Lockfile bump + the dep change that required it | Dep bump + feature work in the same session |

## Workflow

When asked to commit:

### 1. Survey the working copy

Run in parallel:

```bash
git status
git diff          # unstaged
git diff --cached # staged (if any)
git log -5 --oneline
```

Read the full diff. List every changed file and assign it to a logical group (type + scope).

### 2. Plan the commit sequence

Write a short plan before staging — especially when multiple commits are likely:

```
Plan (3 commits):
1. refactor(about): extract experience section into components
2. feat(about): add glossary terms to about page
3. feat(i18n): sync German about page copy
```

**Order commits so each step is valid:**

1. `build` / `ci` / infrastructure others depend on
2. `refactor` that enables later work
3. `feat` / `fix` / `perf` — the functional change
4. `test` — only when tests are a separate, reviewable slice (otherwise keep with the feature/fix)
5. `docs`
6. `chore` / `style` — housekeeping last (unless formatting would obscure an earlier diff)

If unsure whether to split, **prefer one commit** for a single story; ask the user when there are clearly unrelated hunks or they asked to split.

### 3. Commit one group at a time

For each planned commit:

```bash
# Stage only the files/hunks for this group
git add path/to/relevant/files

# Verify the staged diff matches the intended commit — critical before every commit
git diff --cached

# Commit
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

- <bullet one>
- <bullet two>

Refs: Trello #127
EOF
)"

# Confirm clean staging area before the next group
git status
```

After **each** successful commit in this group:

1. `git rev-parse HEAD` for the full SHA.
2. On **each** card listed in `Refs:`, call Trello MCP `add_comment` with SHA + subject (template in `trello-workflow` skill).
3. Update **Agent Notes** on those cards if the commit completes or changes planned work.

Use `git add -p` when a single file contains hunks belonging to different commits.

**Never** `git add .` or `git add -A` unless the entire working copy is one logical commit.

After the final commit, `git status` should show a clean working tree (or only intentionally uncommitted files).

### 4. Summarize commits

Tell the user what was committed:

```
Created 3 commits:
  abc1234 refactor(about): extract experience section into components
  def5678 feat(about): add glossary terms to about page
  ghi9012 feat(i18n): sync German about page copy
```

### 5. Suggest a PR message (always)

**After every commit session** (and when the user asks for a PR title/summary), suggest a **current** PR message for merging **`dev` into `main`**. Do this even when the user only asked to commit — they should not need a separate request.

The summary must reflect **everything on `dev` that is not on `main`**, not only commits from the current session.

#### Gather branch delta (required)

Run (in parallel when useful):

```bash
git fetch origin main dev
git log origin/main..origin/dev --oneline
git log origin/main..origin/dev --format='%s%n%b---'
```

If `origin` is unavailable, use local refs: `git log main..dev --oneline`.

- **Headline theme** — read commit subjects and bodies; skim `git diff origin/main...origin/dev --stat` when grouping is unclear.
- **Trello cards** — collect `Refs: Trello #…` from commits in the range; use those numbers in subsection headings and in the footer. If commits lack refs, ask the user or omit card numbers in headings (still use `Refs:` only for cards you can justify from the branch).

When the user names a different base or head branch, use that pair instead; default remains **`dev` → `main`**.

#### PR message format

Output **two parts**:

1. **Title** — one line for GitHub’s title field (≤ ~72 chars). Lead with the main user-facing theme (often privacy, content, or a named feature), not a commit laundry list.
2. **Body** — markdown in a fenced `markdown` code block for copy-paste.

**No test plan** unless the user explicitly asks for one.

Body structure:

````markdown
## Summary

<One short paragraph: what this PR ships for rmichels.com and any notable bundled work (e.g. “Also bundles … on `dev`”). Plain language; past tense or present perfect is fine.>

### <Theme> (#<idShort>)
- <bullet>
- <bullet>

### <Another theme> (#<idShort> or no card)
- <bullet>

Refs: Trello #127, #128
````

Rules for the body:

- **`## Summary`** — always start with a **prose paragraph** (2–4 sentences), then optional **`###` subsections** for each theme.
- **Subsection headings** — short label plus Trello `#idShort` when that slice maps to a card (e.g. `### Privacy & legal (#127)`). Omit `(#…)` when there is no linked card.
- **Bullets** — under each `###`, use `-` bullets; one idea per bullet; **bold** sparingly for product terms (e.g. **Cookieless Umami**).
- **Group by theme**, not one bullet per commit. Typical groups: privacy/legal, site quality/CI, content, agent/docs, subdomain merges.
- **Order** — user-facing and legal first; CI/tooling/agent last unless the PR is chore-only.
- **Footer** — end with `Refs: Trello #…` listing every card referenced in the PR (comma-separated `#idShort`, same line as in commits).
- **Chore-only** cursor/skills commits can fold into an “Agent / docs” subsection or be omitted if trivial.

#### Example output

**Title:** `Privacy: Termly out, Umami in, click-to-load embeds`

````markdown
## Summary

Ships a privacy-first stack for rmichels.com: no cookie banner, no GA4, first-party EN/DE legal copy, and explicit consent before third-party embeds load. Also bundles recent dev improvements (a11y, filters, CI/E2E, deploy headers) and merges tourguide subdomain legal updates.

### Privacy & legal (#127)
- Replace Termly HTML with Astro components: Privacy Policy (EN/DE), Legal Notice / Impressum, and a **Privacy choices** panel (analytics opt-out, forget remembered embeds).
- **Cookieless Umami** on production only, respecting DNT/GPC/opt-out; legacy `_ga` / consent cookies cleared on boot.
- Case-study **iframes** (YouTube, Sketchfab, Figma, Clirio) become click-to-load placeholders at build time; unregistered hosts fail the build.
- Role filters use **`sessionStorage`** (`rmVisitorFilter`) instead of consent-gated cookies.

### Site quality (already on `dev`)
- Menu/skip-link a11y, Lenis/page-boot split, OR filter semantics, security headers + woff2 on deploy.
- Stronger CI: E2E on deploy, extended `verify-build` (legal routes + dist scan for raw third-party iframes/scripts).
- Tourguide case-study copy + subdomain legal terms merge.

### Agent / docs (#128)
- Trello-linked commit workflow; `AGENTS.md` documents privacy, filters, embeds, and verification loop.
- `dev.bat` — Windows shortcut for `npm run dev`.

Refs: Trello #127, #128
````

## Trello (required)

Follow `.cursor/skills/trello-workflow/SKILL.md` in parallel with this skill.

- [ ] Linked Trello card(s) confirmed before the first commit in the session
- [ ] Each commit footer includes `Refs: Trello #…`
- [ ] Trello comment posted on each linked card after each commit
- [ ] Agent Notes updated when task status changed; human description above `## Agent Notes` untouched

## Quick checklist

- [ ] Full working copy surveyed before first `git add`
- [ ] Split decision made consciously (default one commit per story; avoid layer-by-layer splits)
- [ ] Each commit: one type, one story, builds on its own
- [ ] `git diff --cached` reviewed before every `git commit`
- [ ] Commits applied sequentially, not batched at the end
- [ ] Subject matches `type[(scope)]: description` — lowercase, imperative, no period
- [ ] Body uses `-` bullets (unless trivial single-purpose commit)
- [ ] Breaking changes flagged with `!` or `BREAKING CHANGE:` footer
- [ ] No secrets or unintended build artifacts staged
- [ ] PR title + markdown summary suggested (`origin/main..origin/dev`, prose + `###` sections + Trello `Refs`, no test plan unless asked)

## Additional resources

- Examples, split scenarios, and anti-patterns: [examples.md](examples.md)
- Spec: https://www.conventionalcommits.org/
