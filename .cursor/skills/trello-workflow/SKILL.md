---
name: trello-workflow
description: >-
  Tie portfolio repo work to Trello cards on Portfolio SCRUM: resolve cards by
  #idShort, maintain Agent Notes in card descriptions, and post commit comments.
  Use when starting work, updating task context, committing, or any session that
  should reference Trello.
---

# Trello workflow (Portfolio SCRUM)

Board: **Portfolio SCRUM** (default via MCP `TRELLO_BOARD_ID`). Card numbers like `#127` are Trello **`idShort`** values (see card URL: `/127-…`).

MCP namespace: `project-0-htdocs-trello`. Credentials: env vars per `.cursor/rules/secrets.mdc` — never commit tokens.

## Card reference format

Use this shape in chat, Agent Notes, and commit footers:

```text
#127: Update Privacy Policy, replace termly
- First concrete sub-task or outcome
- Second sub-task
```

- **`#<idShort>:`** must match the card on the active board.
- **Title** should match the Trello card name (minor truncation ok in footers).
- **Bullets** are scope hints for the session; keep them in **Agent Notes** on the card, not in the human-owned description above that heading.

## Resolve a card

1. `get_active_board_info` — confirm **Portfolio SCRUM**.
2. If the user gave `#127`, scan lists with `get_lists` then `get_cards_by_list_id` per list:
   - `fields`: `name,id,idShort,url,desc`
   - Match `idShort === 127`, or use `nameFilter` when only the title is known.
3. Record **`cardId`** (long id) for `get_card`, `add_comment`, and `update_card_details`.

If no card matches, **stop and ask** — do not commit or invent a number.

## Description rules (strict)

| Zone | Who owns it | Agent may edit? |
|------|-------------|-----------------|
| Everything **above** `## Agent Notes` | Human / product | **Never** |
| **`## Agent Notes`** and below | Agent | **Yes** |

### Read current description

Trello MCP `get_card` output is a summary. For the **raw** description string before editing:

1. Note list + name from `get_card`.
2. `get_cards_by_list_id` on that list with `nameFilter` set to a distinctive substring of the card name, `descMaxLength` ≥ 8000 (or omit threshold as needed).

### Update Agent Notes only

1. Let `raw` = current description (empty string if none).
2. Split on the **first** line that is exactly `## Agent Notes` (markdown H2), or `## Agent Notes` with only trailing whitespace on that line.
3. **`prefix`** = text before that heading, unchanged byte-for-byte (including trailing newlines). If the heading is missing, `prefix` = `raw` trimmed only of trailing whitespace, then ensure a blank line before appended notes.
4. **`agentBlock`** = new content **under** the heading (do not repeat the heading inside `agentBlock`).
5. **`description`** = `prefix` + (if `prefix` is non-empty and does not end with `\n\n`, insert `\n\n`) + `## Agent Notes\n\n` + `agentBlock`.
6. `update_card_details` with `{ cardId, description }` only — do not change name, labels, due dates, or list unless the user explicitly asks.

Never delete or rewrite human text above `## Agent Notes`. Never move human content into Agent Notes.

Suggested Agent Notes content during work:

- Session date (UTC or local, be consistent within the card)
- The `#idShort: title` block and bullet plan
- Decisions, blockers, file paths, follow-ups
- `Last updated:` line at the top of the agent block

## Commits (required integration)

Every git commit in this repo must link **one or more** Trello cards.

### Before committing

- Confirm card id(s) with the user when not already stated in the thread.
- Update **Agent Notes** on each linked card if the plan or status changed.

### Commit message shape

Subject, then **blank line**, then **`-` body bullets** (see commit-messages skill), then **blank line**, then footer:

### Commit message footer

After the body bullets (blank line before footer):

```text
Refs: Trello #127, Trello #140
```

Use one `Trello #<idShort>` per card. Order by idShort ascending when multiple.

### Immediately after each successful `git commit`

For **each** referenced card, call `add_comment`:

```text
**Commit** `<full-sha>` — `<subject line>`

`<first line of body>` (optional, only if body exists)
```

Rules:

- One comment per card per commit (duplicate the same comment text on each linked card).
- Use the **full** 40-char SHA from `git rev-parse HEAD` after that commit.
- Subject = first line of the commit message only.
- Do **not** use comments for long-running notes — those belong in **Agent Notes**.

### Multi-commit sessions

Repeat footer + Trello comment **for every commit** in the sequence. Do not batch comments for multiple SHAs unless the user explicitly asked for a single squash-style comment.

## Non-commit work

When the user did not ask for a commit but work is tied to a card:

- Keep **Agent Notes** current (plan, progress, next steps).
- Do **not** add commit-style comments without a new commit.

## Checklist

- [ ] Card(s) resolved on Portfolio SCRUM; `#idShort` verified
- [ ] Human description above `## Agent Notes` untouched
- [ ] Agent Notes updated when task context changed
- [ ] Commit footer includes `Refs: Trello #…` for every commit
- [ ] `add_comment` on each linked card after each commit with SHA + subject

## Additional resources

- Agent Notes merge examples: [agent-notes-examples.md](agent-notes-examples.md)
- Commit format and split workflow: [../commit-messages/SKILL.md](../commit-messages/SKILL.md)
