---
name: xigma-commit-workflow
description: At the end of any task in this repo that leaves file changes, show the user a proposed git commit message (must start with "XG-APP: ") and ask for approval before touching git. Load right before your closing summary whenever `git status` isn't clean. The user's approval of the shown message authorizes commit AND push together — no separate push confirmation needed after that.
---

# xigma: commit-message approval, then commit + push

## When this applies

- End of a task that actually changed tracked files in this repo (feature, fix, refactor, docs,
  roadmap edits, etc.).
- Skip entirely for turns that didn't touch the working tree — check `git status`; if it's clean,
  there's nothing to propose, don't show the form.
- Skip mid-task — this runs once, when the task's changes are actually finished, not after every
  intermediate edit inside a longer piece of work.

## The form

Before your closing summary: run `git status` and `git diff` to see everything that would go into
the commit, draft a message, and show it to the user as its own clearly separated block, e.g.:

```
Proponowany commit:

XG-APP: <short, why-focused summary of what changed>
```

Keep it to one line unless the change genuinely needs a body (rare for this repo's history so far —
`git log` is almost entirely one-line `XG-APP: ...` subjects). End with a short, direct ask for
approval — don't bury it in prose, don't pre-emptively commit before they've seen it.

## Prefix rule

Every message starts with `XG-APP: ` — this repo's established convention (`git log`: `XG-APP: init
project`, `XG-APP: claude permissions`, `XG-APP: roadmap extended`). A drafted message missing the
prefix is a mistake — fix it before showing the form, don't rely on the user to notice.

## After approval

The user reviewing and approving the message shown in the form is authorization for **both** steps
together — commit and push — not just the commit. Once they approve (a plain "ok"/"tak"/similar, or
they hand back an edited message), in that same turn:

1. Stage the specific files the task touched — not `git add -A`, per the repo's normal git safety
   rules (name files explicitly, glance at `git status` after a broad add for anything that
   shouldn't be there).
2. Commit with the approved text verbatim (via heredoc), plus the standard `Co-Authored-By: Claude
   Sonnet 5 <noreply@anthropic.com>` trailer — don't re-summarize or editorialize on top of what was
   approved.
3. Push right after, without asking again — that confirmation already happened when they approved
   the form. Don't force-push; if a plain push is rejected (e.g. remote moved), stop and ask rather
   than reaching for `--force`.

If the user edits the message instead of approving as-is, commit their edited text verbatim — but
if their edit drops the `XG-APP: ` prefix, say so rather than silently re-adding it yourself.

## If there's nothing to commit

Clean working tree → skip the form, skip this whole flow, just give the normal closing summary.
