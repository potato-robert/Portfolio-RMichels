# Agent Notes — merge examples

Heading line must be exactly:

```markdown
## Agent Notes
```

## Example A — empty human description

**Before** (`desc` is empty)

**Agent block to write:**

```markdown
Last updated: 2026-10-01

#127: Update Privacy Policy, replace termly
- Replace Termly embed with in-repo legal components
- Verify EN/DE routes and build-time validation

Decisions: use existing PrivacyPolicyEn/De islands.
```

**After** (full `description` sent to `update_card_details`):

```markdown
## Agent Notes

Last updated: 2026-10-01

#127: Update Privacy Policy, replace termly
- Replace Termly embed with in-repo legal components
- Verify EN/DE routes and build-time validation

Decisions: use existing PrivacyPolicyEn/De islands.
```

## Example B — human content must stay

**Before:**

```markdown
Link for legal review: https://example.com/doc

Acceptance: lawyer sign-off before deploy.
```

**After** (only Agent Notes appended):

```markdown
Link for legal review: https://example.com/doc

Acceptance: lawyer sign-off before deploy.

## Agent Notes

Last updated: 2026-10-01

#127: Update Privacy Policy, replace termly
- In progress: remove Termly script tags from BaseLayout
```

## Example C — replace Agent Notes only

**Before:**

```markdown
Product brief (do not edit)

## Agent Notes

Old session notes from 2026-09-15 — superseded.
```

**After** (`prefix` includes everything through the line before `## Agent Notes`; only the block below the heading changes):

```markdown
Product brief (do not edit)

## Agent Notes

Last updated: 2026-10-01

#127: Update Privacy Policy, replace termly
- Termly removed; running test:content + build
```

## Commit comment example

After:

```text
feat(legal): replace Termly with self-hosted privacy pages

Refs: Trello #127
```

Comment on card `#127`:

```text
**Commit** `a1b2c3d4e5f6789012345678901234567890abcd` — feat(legal): replace Termly with self-hosted privacy pages
```
