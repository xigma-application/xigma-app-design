---
name: xigma-e2e-coverage
description: When a change to Design-canvas interaction (new tool, gesture, or selection rule) needs a Playwright e2e test in e2e/design/, not just unit tests or a one-off MCP demo. Load before calling any change to canvas interaction "done" — right after implementation, before reporting completion.
---

# xigma e2e Coverage

## The rule

Finishing a change that adds or modifies **interactive Design-canvas behavior** — a new tool, a
new pointer gesture, a new selection rule, anything a user does with the mouse/keyboard on the
canvas — is not complete until `e2e/design/` has a test that would fail if the behavior
regressed. Write it in the **same change**, not as a follow-up the user has to ask for.

This was missed for real: the marquee-selection feature (touch-vs-Control-containment drag-select)
shipped with full unit coverage and a live `mcp__playwright__*` visual demo confirming it worked —
but no committed e2e test. A live MCP demo proves the feature works *once, in that session*; it
leaves nothing behind. Only a `*.spec.ts` under `e2e/` is a permanent regression check. The user had
to explicitly ask for the e2e test as a separate step. Don't wait to be asked next time.

## What does and doesn't need one

Needs an e2e test:
- A new tool or drag gesture on the canvas (frame drawing, marquee select, pan, zoom, resize handles
  once those exist).
- A new selection rule, especially one with real browser-timing stakes (something must/must not
  happen while a button is still held, a modifier key changes behavior, coordinates must survive a
  pan/zoom).
- Anything where the interesting part is genuine **browser + rendering + timing integration** —
  the kind of bug a synthetic `PointerEvent` in jsdom can paper over.

Does not need a new e2e test:
- A pure refactor with no behavior change.
- A new branch in logic already exhaustively covered by the unit suite, where the e2e assertion
  would just be "prove *something* changed" duplicating what `store.getState()` already asserts
  precisely in the unit test — see `e2e/design/docs/TEST_CASES.md`'s own "Why so few scenarios get
  e2e coverage" section for the standing rationale and its worked examples (most of the 18
  cataloged selection scenarios are unit-only for exactly this reason).

The bar is "would a real browser catch something a unit test can't", not "did any code change".

## How

1. Add the test to the most relevant existing file under `e2e/design/` (e.g. `selection.spec.ts`
   for selection-related behavior) or create a new `<feature>.spec.ts` there if none fits.
2. Use the `DesignPage` page object (`e2e/design/model/DesignPage.ts`) — `goto`, `selectTool`,
   `drawFrame`, `click`, `pointerDown`/`pointerMove`/`pointerUp`, `panBy`, `zoomAt`. Extend it with a
   new helper method if the gesture needs one not yet covered, following the existing methods'
   shape (thin wrappers over `page.mouse`/`page.keyboard`).
3. Assert via canvas screenshot equality/inequality (`await designPage.canvas.screenshot()`, then
   `.equals(...)`) — the canvas is a bare WebGL element with no per-node DOM or a11y tree, and
   `store.getState()` isn't reachable from e2e, so this is the only assertion mechanism available.
   Prefer comparing two *of your own* screenshots (before/after, mode-A/mode-B) over asserting an
   exact pixel pattern — see `selection.spec.ts`'s Control-vs-touch marquee test for the pattern:
   drag the identical box twice, once per mode, and assert the two results differ.
4. Update the scenario table in `e2e/design/docs/TEST_CASES.md` in the same change: add a numbered
   row, mark Unit/E2E coverage with ✅/—, and if e2e is deliberately skipped for that scenario, say
   why inline (matching the existing entries' style) rather than leaving the reader to guess.
5. Run `npx playwright test` before reporting the change done.

## Related

[[xigma-playwright-mcp-testing]] — the two different browser-testing paths (automated
`npx playwright test` vs. live visible MCP demo) and when to reach for each; this skill is about
*whether a permanent test is owed*, that one is about *how to run/demo either kind*.
[[xigma-test-conventions]] — unit test structure/step-comment convention; unrelated axis (applies
to the unit-level `.spec.ts(x)` files, not the `e2e/` Playwright suite).
