---
name: commit-messages
description: >-
  Analyze the working copy, split changes into logical Conventional Commits
  when appropriate, commit them sequentially, link each commit to Trello cards,
  post Trello commit comments, and always suggest a copy-paste GitHub PR
  message summarizing unmerged commits. Use when the user asks to commit, write
  commit messages, stage changes, review the working copy, or wants a PR summary.
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
| `deploy` | FTPS, hosting, `.htaccess` |
| `deps` | `package.json` / lockfile updates |

Omit scope when the change is repo-wide or doesn't fit a single area.

## Split or single commit?

**Default: analyze the full working copy first.** Do not blindly commit everything in one shot.

### Keep a single commit when

- All changes serve **one story** (e.g. a bug fix and its regression test)
- The diff is **small and atomic** (typo, config tweak, single-file change)
- Splitting would leave **intermediate commits broken** (feature without its required companion change in the same push)
- Changes are **tightly coupled** — separating them obscures intent more than it helps review

### Split into multiple commits when

- Changes span **different types** (`feat` + `ci` + `docs`)
- Changes span **unrelated scopes** (`content` case study + unrelated `islands` fix)
- A **refactor** is mixed with feature or fix work — isolate the refactor so the functional commit stays readable
- **Generated or bulk files** (lockfile, `dist/`) should be separate from source changes — or excluded entirely unless intentional
- Any slice would make **`git bisect`** or **`git revert`** painful if kept together

When splitting, **commit sequentially** — finish and verify each commit before starting the next. Do not batch-plan five commits and only run `git commit` once at the end.

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

If unsure whether to split, prefer splitting — but ask the user when groups are ambiguous or equally valid.

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

**After every commit session**, suggest a PR message for the unmerged branch. Do this even when the user only asked to commit — they should not need a separate request.

Determine the base branch (`main` unless the user specifies otherwise):

```bash
git log main..HEAD --oneline
git branch --show-current
```

#### PR message format

Output **two parts**:

1. **Title** — one short line for the GitHub PR title field (≤ ~72 chars). Name the main theme, not every commit.
2. **Body** — markdown only, wrapped in a fenced `markdown` code block so the user can copy-paste into GitHub.

**No test plan.** Summary only.

Body template:

````markdown
## Summary

- <grouped change 1>
- <grouped change 2>
- …
````

#### Writing rules

- **Group related commits** into one bullet — do not list one bullet per commit unless there are ≤3 commits total.
- **Past tense or neutral phrasing** is fine in bullets (`Add …`, `Fix …`, `Refactor …`); match commit intent, not commit subject verbatim.
- **Order bullets** by importance: user-facing changes first, then refactors/tooling/chore last.
- **Chore-only commits** (cursor skills, formatting) can be omitted from the summary unless they are the whole branch.
- If the branch has a single commit, one bullet is enough.

#### Example output

**Title:** `WebGL refactor, content pipeline, and layout polish`

````markdown
## Summary

- Render gist embeds as static Shiki code blocks at build time; fix project page HTML from markdown blank lines; add gallery alt text and refine team metadata
- Extract shared WebGL modules with performance tiers; update architecture docs
- Refactor content validation around a shared schema; run check/tests before deploy
- Archive legacy LAMP PHP/JS artifacts
- Fix project panel hero distortion; tighten content margins; refactor about page to CSS grid; remove resume links and refresh bio copy
- Fix landing model overflow and responsive see-more button; reset project tile parallax on breakpoint change
- Reorder project filter roles for job-application focus
````

## Trello (required)

Follow `.cursor/skills/trello-workflow/SKILL.md` in parallel with this skill.

- [ ] Linked Trello card(s) confirmed before the first commit in the session
- [ ] Each commit footer includes `Refs: Trello #…`
- [ ] Trello comment posted on each linked card after each commit
- [ ] Agent Notes updated when task status changed; human description above `## Agent Notes` untouched

## Quick checklist

- [ ] Full working copy surveyed before first `git add`
- [ ] Split decision made consciously (single vs multi)
- [ ] Each commit: one type, one story, builds on its own
- [ ] `git diff --cached` reviewed before every `git commit`
- [ ] Commits applied sequentially, not batched at the end
- [ ] Subject matches `type[(scope)]: description` — lowercase, imperative, no period
- [ ] Body uses `-` bullets (unless trivial single-purpose commit)
- [ ] Breaking changes flagged with `!` or `BREAKING CHANGE:` footer
- [ ] No secrets or unintended build artifacts staged
- [ ] PR title + markdown summary suggested (grouped bullets, no test plan)

## Additional resources

- Examples, split scenarios, and anti-patterns: [examples.md](examples.md)
- Spec: https://www.conventionalcommits.org/
