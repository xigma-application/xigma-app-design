---
name: xigma-internal-docs
description: This repo keeps implementation-architecture reference docs under .claude/docs/ (e.g. design-tool-architecture.md) — separate from the product-facing docs/ROADMAP.md. Load the matching file before starting a non-trivial implementation task in an area it covers, and write down what's new or changed after finishing. Load before starting work that touches an area with an existing .claude/docs/*.md file, and again right before your closing summary on any non-trivial implementation task to check whether the docs need updating.
---

# xigma Internal Docs

## What this is

`.claude/docs/` holds architecture/"how this system is wired" reference files — written for
**Claude**, not for the product's users or its own README. It's separate from
`docs/ROADMAP.md` (product-facing, tracks what's built vs. planned) and separate from the global,
cross-project auto-memory system (`~/.claude/projects/.../memory/`, which explicitly excludes
architecture since normal memory is expected to go stale independently of the code). Files here are
committed alongside the code they describe, so they can be kept in sync with it in the same change
— see `.claude/docs/design-tool-architecture.md` for the current example (how a Design canvas draw
tool is assembled, written after implementing the Arrow tool).

## Before starting work

If `.claude/docs/` contains a file matching the area you're about to touch, read it **before**
exploring the codebase with `grep`/`Explore` — it exists specifically to skip that rediscovery.
Check `ls .claude/docs/` (or the file listing already in context) rather than assuming none exists.

A doc found this way is a claim about the architecture as of when it was written, not a guarantee —
if something it says doesn't match what you find in the actual source (a renamed file, a changed
pattern), trust the source and treat the doc as due for an update (see below), not as authoritative
over what you're looking at.

## After finishing work

Before your closing summary on any non-trivial implementation task, ask: did this introduce or
change a pattern/mechanism worth another session (or a fresh session with zero conversation
context) knowing about, without re-deriving it from scratch? If yes:

- **The topic already has a file** (e.g. another change to a Design draw tool) — extend it in the
  same change: add the new specifics, correct anything that drifted, keep the worked-example section
  current if one exists.
- **The topic has no file yet** — add a new one, `.claude/docs/<topic>.md`, following the shape of
  the existing files (concern-by-concern breakdown of the files/mechanisms involved, a checklist if
  the task is a repeatable recipe, a concrete worked example referencing the actual change/commit).
- **Skip it** for pure bugfixes, one-off content changes, or anything where the "architecture" is
  already fully obvious from the code itself with no non-trivial wiring to remember — don't create
  a doc file just because a task happened.

This is deliberately not automatic/silent — do it as a visible step (mention the doc file you
wrote or updated in your closing summary), not folded silently into the commit.

## Related

[[xigma-e2e-coverage]] — same "don't make the next session/change re-discover this the hard way"
motivation, but for permanent regression tests instead of architecture docs; a single task can owe
both.
