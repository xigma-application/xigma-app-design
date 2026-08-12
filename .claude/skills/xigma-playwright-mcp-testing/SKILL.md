---
name: xigma-playwright-mcp-testing
description: How to run and demo browser tests for xigma via the Playwright MCP server (visible Chromium) and via the e2e/ Playwright Test suite. Load before running/writing e2e tests, or when asked to "run/show a test in the browser" or "test the canvas tools".
---

# xigma Playwright MCP Testing

Two separate ways to exercise the app in a real browser — pick based on what's being asked.

## 1. Automated regression suite (`npx playwright test`)

- Config: `playwright.config.ts` (project root). `testDir: ./e2e`, project `chromium` only,
  `webServer` auto-starts `npm run dev` on `localhost:5173` if not already running
  (`reuseExistingServer: true`).
- Spec files: `e2e/smoke.spec.ts`, `e2e/create-frame.spec.ts`.
- Run: `npx playwright test` (headless, fast — this is what CI/regression checks should use).
- `--headed` does **not** give a useful visual demo — the suite runs in ~1-2s, the window
  flashes and closes before anyone can see it. Don't reach for `--headed` when the user wants to
  *watch* something; use the MCP flow below instead.

## 2. Live visible demo (`mcp__playwright__*` MCP tools)

Use this when the user wants to *see* an interaction happen (e.g. "odpal to w przeglądarce",
"pokaż mi jak to działa"). The MCP server (`.mcp.json`, `--browser chromium`, no `--headless`)
opens a real on-screen Chromium window.

Sequence:

```
mcp__playwright__browser_navigate   -> http://localhost:5173/design/<any-id>
mcp__playwright__browser_snapshot   -> get element refs (canvas has no a11y role, won't appear;
                                        toolbar buttons do, e.g. radio "frame" [ref=eNN])
mcp__playwright__browser_click      -> select the tool, target = ref from snapshot
mcp__playwright__browser_run_code_unsafe -> raw page.mouse.move/down/move.../up for canvas drag
                                             (browser_drag only supports element-to-element,
                                             not arbitrary coordinates — not usable for drawing)
mcp__playwright__browser_take_screenshot -> visual proof, also shown inline in chat
mcp__playwright__browser_close      -> ALWAYS close when the demo/run is done — see below
```

Root `/` renders the Vite-starter `HomePage`, not the editor. The canvas/toolbar only mount on
`/design/:id` (`DesignPage`, see [[xigma-routing]]) — `DesignPage` doesn't validate `:id`, any
string works, e.g. `/design/e2e-live-demo`.

Timing for the drag animation: keep it brief. ~15-20 `mouse.move` steps with ~20ms between them
plus a ~1-2s pause before the final screenshot is enough to be visible without feeling slow. An
8-step-per-second-or-slower drag or an 8s+ trailing pause reads as "too long" — this was
explicit user feedback, don't overcorrect back to it.

**Always call `mcp__playwright__browser_close` right after the final screenshot**, before
reporting results. The user has no way to tell a demo is finished otherwise — a lingering open
window reads as "still working." This does not apply to `npx playwright test` runs, which close
their own browser automatically.

## Frame-tool interaction model (for any canvas-drawing demo/test)

From `useFrameTool.ts`: selecting the tool arms `pointerdown`/`pointermove`/`pointerup` on the
`<canvas>`. `pointerup` commits the node only if `width`/`height >= MIN_FRAME_SIZE` (2px,
`Canvas/constants.ts`), then **always** dispatches `setActiveTool(default)` regardless of
whether a node was committed — so the toolbar reverting to "default" is not proof a frame was
created, only that the pointer sequence completed. There is no layers panel or selection
inspector in the app (verified absent) — the only way to confirm a frame rendered is a
before/after screenshot diff of the canvas, since it's a bare WebGL `<canvas>` with no
per-node DOM.

## Permissions

All `mcp__playwright__*` tool names are individually allow-listed in `.claude/settings.json`
(a `mcp__playwright__*` wildcard entry does **not** suppress prompts — list exact tool names).
This project's `.claude/settings.local.json` also sets `permissions.defaultMode:
"bypassPermissions"` for this user, so nothing in this project prompts at all.

## Related

[[xigma-e2e-coverage]] — a live MCP demo (path 2 above) proves a feature works once, in that
session, and leaves nothing behind; it does not substitute for a committed test under `e2e/`. That
skill covers *whether* a change owes a permanent regression test — load it once implementation is
done, before reporting the change complete.
