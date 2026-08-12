---
name: xigma-test-conventions
description: Unit test structure and step-comment convention for xigma, mirrored from x-design. Load before writing or reviewing any .spec.ts(x) file — covers describe/it naming and the // mock / // spy / // before / // find / // action / // wait / // result step comments.
---

# xigma Test Conventions

Mirrors x-design, verified by grepping its spec files (~1400 `// result`, ~1400 `// before`, ~640
`// mock`, ~460 `// action`, ~85 `// find`, ~20 `// wait` occurrences), e.g.
`src/shared/UI/Button/Button.spec.tsx`, `src/shared/UI/Tooltip/Tooltip.spec.tsx`.

## A test file is mandatory for every util and hook

Whenever a new file is added under a `utils/` folder (one function) or a `hooks/` folder (one hook),
create its `test/` spec in the same change — not as a follow-up someone might ask for later. This
came up explicitly for `Canvas/utils/*` and `Canvas/hooks/*` and applies project-wide, not just
there.

- Util → `utils/test/<functionName>.spec.ts` (plain `.ts`, no JSX — e.g.
  `utils/test/hexToRgbFloat.spec.ts`, mirroring `translations/utils/test/getInitialLanguage.spec.ts`).
- Hook → `hooks/test/<hookName>.spec.tsx` (`.tsx`, since hook tests go through
  `@testing-library/react`'s `renderHook` and may need JSX for wrappers — e.g.
  `hooks/test/useCanvasResize.spec.tsx`).

Both follow the nested `test/` placement from [[xigma-module-structure]] (components co-locate
their spec directly instead — this nested-`test/` rule is specifically for utils/hooks). Components
still follow their own component-structure rule of a co-located `.spec.tsx` with no `test/` folder.

## `describe` / `it` naming

- `describe('<Name> snapshots', ...)` — render + `toMatchSnapshot()` tests.
- `describe('<Name> behaviors', ...)` — interaction tests (click, keyboard, hover, etc.).
- `describe('<Name> props', ...)` — occasional third bucket for components with many prop-driven
  variants (one `it` per prop).
- Every `it(...)` title starts with `'should ...'`.

## Step comments inside `it`

Each meaningful block of a test body gets a single lowercase `//` comment naming the step, with a
blank line between steps. In order — all optional except `before` and `result`, which appear in
nearly every test:

1. `// mock` — test-specific fixtures or data (plain values, `vi.stubGlobal(...)`, objects to pass
   in) — skip if nothing beyond module-level consts is needed.
2. `// spy` — `vi.spyOn(...)` calls, whenever the test intercepts/observes an existing method rather
   than just constructing fresh data. Separate from `// mock` even when both appear in the same
   test — mock is data, spy is interception. A bare `vi.fn()` used to build a fake object (no
   `spyOn`) stays under `// mock`, since nothing existing is being intercepted.
3. `// before` — arrange: render the component / `renderHook` the hook / set initial state / call
   the function under test.
4. `// find` — query the DOM for the element under test, when it isn't already returned directly
   by `before` (e.g. `container.querySelector(...)`, `getByE2EAttribute(...)`, `screen.getByRole(...)`).
5. `// action` — the interaction under test (`fireEvent.click(...)`, `user.click(...)`, dispatch).
6. `// wait` — an explicit async settle (`await sleep(100)`), only when waiting is its own step,
   separate from the action and from the assertion. Contrast with `await waitFor(() => expect(...))`
   — that stays under `// result`, since the wait and the assertion happen in the same call.
7. `// result` — the assertion(s). Always last.

## Worked example

From `Button.spec.tsx` — full chain:

```tsx
describe('Button behaviors', () => {
  it('should render rippleEffect after click', async () => {
    // before
    const { container } = customRender(<Button>{content}</Button>);

    // find
    const button = getByE2EAttribute(container, E2EAttribute.button);

    // action
    fireEvent.click(button);

    // result
    await waitFor(() => {
      expect(button.lastChild).toHaveClass(`${classNames[classNameButton].name}--${RIPPLE_EFFECT_MODIFICATOR}`);
    });
  });
});
```

No interaction, so no `find`/`action`:

```tsx
describe('Button snapshots', () => {
  it('should render Button', () => {
    // before
    const { asFragment } = customRender(<Button>{content}</Button>);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
```

`// mock` for test-specific data, `// wait` as its own settle step (from `Tooltip.spec.tsx`):

```tsx
it('should show tooltip on hover', async () => {
  // action
  fireEvent.mouseEnter(document.getElementById('test'));

  // wait
  await sleep(100);

  // result
  expect(...).toBe(...);
});
```

`// mock` for plain data, `// spy` for `vi.spyOn` — from `Canvas/utils/test/resizeCanvas.spec.ts`:

```ts
it('should update the WebGL viewport to match the new size', () => {
  // mock
  vi.stubGlobal('devicePixelRatio', 1);

  const canvas = document.createElement('canvas');
  const viewport = vi.fn();

  // spy
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 50, width: 100 } as DOMRect);
  vi.spyOn(canvas, 'getContext').mockReturnValue({ viewport } as unknown as WebGL2RenderingContext);

  // before
  resizeCanvas(canvas);

  // result
  expect(viewport).toHaveBeenCalledWith(0, 0, 100, 50);
});
```

## xigma specifics

We use Vitest, not Jest — `describe`/`it`/`expect` are API-compatible, no translation needed.
Snapshots resolve to a sibling `snapshots/` folder (`vite.config.ts`'s `resolveSnapshotPath`).
See [[xigma-import-order]] for how the imports above these tests are ordered.
