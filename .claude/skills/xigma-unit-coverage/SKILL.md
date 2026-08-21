---
name: xigma-unit-coverage
description: xigma enforces 100% unit test coverage (branches/functions/lines/statements) via vite.config.ts's coverage.thresholds. Load before saying a change is "done" — run `npm run test:coverage` and add a targeted test for any line the report flags, rather than only running the plain `vitest run` suite. Finish every change with `npm run prettier:write`, not just coverage-driven ones.
---

# xigma Unit Coverage — 100% Enforced

## The threshold is real, not aspirational

`vite.config.ts`'s `test.coverage` block sets all four metrics to 100%:

```ts
coverage: {
  exclude: ['src/main.tsx', 'src/assets/**'],
  provider: 'v8',
  thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
}
```

`npm run test:coverage` (= `vitest run --coverage`) **fails the run** if any metric drops below
100% — it's not a soft report to eyeball, it's a hard gate. `npx vitest run` (no `--coverage`)
passing is not sufficient proof a change is finished in this repo; that command doesn't check
thresholds at all, so a change can pass every test and still leave the coverage gate red.

`src/main.tsx` and `src/assets/**` are the only exclusions (entry point, static SVG/image assets) —
everything else, including every hook/util/component you touch, is held to the same 100% bar.

## Workflow

1. After implementing (or before calling a change complete), run `npm run test:coverage`.
2. If it fails, the report's **Uncovered Line #s** column pinpoints the exact gap per file — read
   the flagged lines directly rather than guessing which test to add.
3. Add a test that exercises that specific branch/line — not a padding assertion that happens to
   touch the line incidentally. If the gap is a whole conditional branch (an `if` that's never
   taken the other way), the missing test is usually "the gesture/input that takes the *other*
   path," not a duplicate of an existing test.
4. Re-run `npm run test:coverage` until clean, then run the plain `vitest run` suite once more (the
   coverage instrumentation can occasionally mask a timing issue) plus `tsc -b`/`eslint`.
5. Always finish by running `npm run prettier:write` — every change, regardless of whether coverage
   was actually the thing that needed fixing. This is the last step, after tests/tsc are already
   green, not a substitute for them.

## Don't re-run it redundantly once it's green

Once `npm run test:coverage` passes clean (100% across all four metrics) after the actual
unit-test-relevant changes are in, a **later** step in the same task that doesn't touch any `src/**`
`.ts`/`.tsx` file (implementation or `.spec.ts(x)`) does not need a second full run. This includes:
running `npm run prettier:write` (formatting-only diffs can't change coverage), adding/editing an
`e2e/**` Playwright spec, updating `TEST_CASES.md`, or writing/updating `.claude/docs/**` notes. Run
`tsc -p tsconfig.app.json --noEmit` (cheap) and/or `npx playwright test` for e2e-only follow-up work
instead of paying for the full ~90s+ coverage run again. Only re-trigger `test:coverage` if a `src/**`
unit-relevant file changes again after the last green run.

## Worked example: a gesture's *release* path, not just its *start*

`useSelectionTool.ts`'s `handlePointerUp` has an `if (endpointDragRef.current) { endpointDragRef.current
= null; canvas.releasePointerCapture(...); }` block — the cleanup for a line-endpoint drag. Every
existing endpoint-drag test dispatched `pointerdown` + `pointermove` and asserted the node moved,
but **never dispatched `pointerup`** — so that cleanup branch stayed at 0% despite the drag
*behavior* itself being thoroughly tested. The fix wasn't a new mechanism, just a test that
completes the gesture:

```tsx
canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 2800, 700));
canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2820, 760));
canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 2820, 760));

expect(canvasRef.current?.releasePointerCapture).toHaveBeenCalledWith(1);
```

This is the most common shape of a coverage gap in this codebase: a hook's `handlePointerDown`/
`handlePointerMove` paths get exercised by tests that only go as far as proving the interesting
state change happened, and the `handlePointerUp` cleanup/reset branch (or an early-exit guard) is
left untouched. When a test only dispatches `pointerdown`+`pointermove`, check whether the missing
coverage is actually the `pointerup` half of that same gesture before writing something new.

## Related

[[xigma-test-act-wrapping]] — completing a gesture in a new test often means adding a
`pointerup`/`pointerdown` `dispatchEvent` call; wrap the whole sequence in `act()` if the handler
dispatches state the component subscribes to, per that skill's rule.
[[xigma-e2e-coverage]] — a different axis: *whether a change needs a permanent Playwright
regression test* for real-browser/timing behavior a unit test can't see, independent of whether the
unit suite already hits 100% line coverage. A line can be 100% covered by a unit test and still
lack e2e coverage, and vice versa.
[[xigma-test-conventions]] — the `describe`/`it` naming and step-comment shape any coverage-gap
test should still follow; a coverage-driven test is not an excuse to skip the convention.
