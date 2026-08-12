---
name: xigma-module-structure
description: Where a type, constant, or utility function belongs inside a feature folder in xigma — types.ts vs constants.ts vs a utils/ folder, mirrored from x-design. Load before adding a new file to an existing feature folder (core/Routing, hooks/useX, translations, ...) or deciding where new code should live.
---

# xigma Module Structure

Verified against x-design: 40/40 `types.ts` files contain zero `export const` (types/interfaces
only, no runtime code), and 0 `constants.ts` files export a `type`/`interface` — the two are never
mixed. 13+ folders (`core/ReduxHookForm`, `hooks/useTheme`, `store/pageBuilder`,
`shared/UI/Tooltip`, ...) keep a `types.ts` and a `utils/` folder side by side.

## Where things go, inside a feature folder

- **`types.ts`** — type/interface declarations only. No `export const`, no functions. May import
  from `./constants` (e.g. `type TLanguage = (typeof AVAILABLE_LANGUAGES)[number]`) — that
  direction is fine, just never the reverse (`constants.ts` must not import from `./types`).
- **`enums.ts`** — `enum` declarations, kept in their own file, separate from both `types.ts` and
  `constants.ts` (verified: `store/pageBuilder/`, `shared/UI/`, `types/` all keep `enums.ts`
  alongside a distinct `constants.ts`). **Both the member name and its string value are camelCase**,
  and the two match exactly — e.g. `northEast = 'northEast'` (`store/pageBuilder/enums.ts`'s
  `AnchorResize`/`AnchorRotate`), `comment = 'comment'` (xigma's own `ToolName`). Never PascalCase,
  kebab-case, or snake_case on either side — this applies to every enum in the project, including
  ones that only ever have single-word members today (`ToolName`, `RouteName`): a later multi-word
  addition (e.g. `extraSmall = 'extraSmall'`) must stay camelCase on both sides too, not just the
  already-existing entries. `types.ts` and `constants.ts` may both import from `./enums`.
- **`constants.ts`** — runtime constant values (strings, numbers, maps) built from those enums, e.g.
  `DEFAULT_TOOL = ToolName.select`. No types/interfaces, no enum declarations themselves.
- **`utils/`** — one file per utility function, named after the function it exports
  (`utils/getRouteByName.ts` exports `getRouteByName`), not a single grab-bag `utils.ts`.
- **`hooks/`**, **`components/`** — same idea: subfolders once there's more than a trivial single
  item, each item in its own file/folder.

`types.ts` and `constants.ts` sit at the feature root; `utils/`, `hooks/`, `components/` are
subfolders.

## Example (`core/Routing/`)

```
core/Routing/
  types.ts               — TGuard, TAppRouteData, TComponent (types only)
  constants/
    routes.ts             — RouteName enum, ROUTES map (runtime values)
    appRoutesData.ts
  utils/
    getRouteByName.ts      — one function per file
    renderRoute.tsx
  components/
    ProtectedRoute/
    Title/
```

And `translations/`, same shape:

```
translations/
  types.ts                — TLanguage
  constants.ts             — AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY
  utils/
    getInitialLanguage.ts
  languages/
    en.json
    pl.json
```

## A hook with its own utils gets its own folder — utils never sit one level too high

`utils/` at a feature root (`Canvas/utils/`, `Routing/utils/`) is for helpers genuinely shared
across that feature's hooks/components. A helper used by exactly one hook does not belong there —
it belongs inside that hook's own folder, promoting the hook from a flat `hooks/useX.ts` file to
`hooks/useX/useX.ts` with a sibling `utils/`. Confirmed against x-design's
`hooks/useResizeHandler/` (`useResizeHandler.tsx` + `utils/handleMouseDown.ts`) and
`hooks/useKeyboardHandler/` (`useKeyboardHandler.tsx` + `types.ts` + `utils/handleLockBrowserEvents.ts`
+ `utils/triggerActions.ts`).

```
hooks/
  useCanvasRenderLoop/
    useCanvasRenderLoop.ts
    useCanvasRenderLoop.spec.tsx
    utils/
      drawScene/
        drawScene.ts
        drawSceneNodes.ts
        drawSelectionOutline.ts
        drawGroupSelectionOutline.ts
        drawPerNodeSelectionOutlines.ts
        drawFrame.ts
        ...
        test/
          drawScene.spec.ts
          drawSceneNodes.spec.ts
          ...
      startRenderLoop.ts
      createProgram.ts
      ...
      test/
        startRenderLoop.spec.ts
        ...
  useCanvasResize/
    useCanvasResize.ts
    useCanvasResize.spec.tsx
    utils/
      resizeCanvas.ts
      test/resizeCanvas.spec.ts
```

**Naming, corrected by the user:** this folder/orchestrator was originally called `drawFrame`/
`drawFrame.ts`, and the per-tool draft-preview drawer (below) was `drawDraftFrame.ts`. Both names
collided the word "frame" across two unrelated meanings: a *render* frame (one tick of the
`requestAnimationFrame` loop — what the orchestrator actually draws, the whole scene each tick)
and a Design **Frame** (`NodeType.frame`, what the draft-preview drawer actually draws — the
in-progress frame node being dragged out with the Frame tool). Renamed so each name means only one
thing: the orchestrator is `drawScene`/`drawScene.ts` (folder `drawScene/`), and the function that
used to be `drawDraftFrame` is now simply `drawFrame.ts` — it's the one function in this codebase
that's actually about drawing a Design frame.

`drawSceneBackground.ts`, `drawBackground.ts`, `drawCornerHandles.ts`, and `drawRect.ts` used to sit in
this tree too, but moved out to the global `utils/canvas/` — see the next section for why.

Two things change once a hook gets this treatment:

- The hook's own spec **co-locates directly** beside it (`useX.spec.tsx`, no nested `test/`) — same
  as a component. The nested-`test/` rule from [[xigma-test-conventions]] still applies, but only
  one level down, to the hook's own `utils/` (`utils/test/<functionName>.spec.ts`).
- If a util is only ever reached through another util in the same cluster (e.g. `createProgram` →
  `createShader`), that whole chain moves together — check actual usage (`grep -rl` for the export
  name) rather than assuming one util's flatness; a single hook can own a dozen `utils/` files if
  nothing outside that hook's tree imports them.

Before adding a new util under a shared feature-root `utils/`, check whether it's actually used from
more than one hook/component in that feature — if not, it belongs in the owning hook's own folder,
not the shared one.

## A massive function gets its own folder too — not just hooks

The same promotion applies one level deeper, to a single util function, not only to hooks: once a
function accumulates heavy branching ("ifologia" — nested `if`/`else` chains covering several
draw/compute cases) it should be split into smaller named helper functions **and** promoted from a
flat file to its own folder, exactly like a hook is. `drawScene.ts` (originally named `drawFrame.ts`
— see the naming note above) is the worked example — it used to be one flat file mixing
background-clear, per-node fill, selection-outline branching (group vs. per-node), and draft-rect
drawing in one function body. Split into `drawSceneBackground`/`drawSceneNodes`/
`drawSelectionOutline` (+ its own `drawGroupSelectionOutline`/`drawPerNodeSelectionOutlines`
branches) /`drawFrame` (the draft-preview drawer, originally `drawDraftFrame`), with `drawScene.ts`
itself reduced to a thin orchestrator calling each in sequence — see the tree above.

Rules for this promotion, confirmed by re-running `grep -rl` for every export name after the split:

- The split-out pieces sit **flat as siblings** inside the new folder (`drawScene/drawSceneNodes.ts`),
  **not** in a further nested `utils/` — one extra folder level is enough; don't nest a `utils/`
  inside a `utils/`-owned function folder too.
  ([[xigma-function-style]] covers the split itself — small named functions, positive if-guards —
  this skill only governs where the resulting files live.)
  User correction: the first pass of this exact split nested the new pieces under a
  `drawScene/utils/` subfolder — the user asked for them flat under `drawScene/` directly instead,
  which is now the standard for this pattern.
- Its spec moves into a **nested `test/`** (`drawScene/test/drawScene.spec.ts`), same as any other
  function inside a `utils/`-style folder — unlike a promoted hook, a promoted function does **not**
  get a co-located spec, since it was never co-located to begin with (it was already in a
  `utils/test/` folder before the promotion).
- The "chain moves together" rule (grep-verified reachability) is still the right first filter for
  candidates, but it is **necessary, not sufficient** — apply the test below to each candidate
  before deciding it stays local.

**Domain awareness, not reachability, decides feature-local vs. global `utils/<category>/`.** Ask
whether the function's own parameters/body reference the *feature's* domain vocabulary
(`TSceneNode`, "selection", "draft rect", `store`/selectors) or whether it only ever talks about
generic primitives (a rect's x/y/width/height, a hex color, a WebGL context) that any canvas-drawing
feature could reuse — regardless of who happens to import it today. `drawScene.ts` and its direct
siblings (`drawSceneNodes`, `drawSelectionOutline`, `drawGroupSelectionOutline`,
`drawPerNodeSelectionOutlines`, `drawFrame`) stayed in `drawScene/`: every one of them takes or
branches on `TSceneNode[]`/selection state, i.e. Design-domain concepts. `drawSceneBackground`,
`drawBackground`, `drawCornerHandles`, `drawRect`, `getRectCorners`, `hexToRgbFloat`, and
`hexToRgbaFloat` all moved to the **global `src/utils/canvas/`** (one function per file + `test/`,
folder named for *what it draws on*, not the math-vs-color distinction the folder started as) —
none of them knows what a "node" or "selection" is; they only take a rect/color/gl handle and draw
or convert it. This first version of this rule tried "does it take a `gl`/`program`/`buffer`
param" as the dividing line and put `drawBackground`/`drawCornerHandles`/`drawRect` on the
feature-local side — that heuristic was wrong (confirmed by direct user correction): WebGL-specific
parameters don't imply domain-specific logic. The real test is the vocabulary inside the function
body, not its parameter types.

**A file under global `utils/<category>/` (or `types/<name>.ts`, `constant/<name>.ts`) must never
import from `components/...`.** The dependency direction is one-way: features import from the
global layer, never the reverse — a global util reaching back into a specific feature's folder is a
sign the util (or the value it needs) isn't actually global yet. When `drawBackground`/
`drawCornerHandles`/`drawRect`/`getRectCorners` moved to `utils/canvas/`, they kept importing
`TDraftRect` from `components/Design/Canvas/types` and `BACKGROUND_COLOR`/`CORNER_HANDLE_SIZE` etc.
from `components/Design/Canvas/constants` — that reverse dependency was caught and corrected by the
user. Fix: relocate the values themselves, not just re-point the import.
- Feature-specific `types.ts` values that generic global code needs move to a new top-level
  `src/types/<name>.ts` (e.g. `types/canvas.ts` got `TDraftRect`/`TPoint`, moved wholesale out of
  `Canvas/types.ts` — that file was deleted once empty, and **every** consumer across the feature
  (not just the newly-global ones) was repointed to `types/<name>.ts`, since a type doesn't get
  duplicated between a local and a global copy).
- Same for `constants.ts` values: they move to `src/constant/<name>.ts` (matches the existing
  one-file-per-topic shape of `constant/colors.ts`, `constant/appName.ts`). Only the constants the
  global code actually needs move — constants still exclusively used inside the feature
  (`DRAFT_FRAME_STROKE`, `MIN_FRAME_SIZE`, the `ZOOM_*` family, `WEBGL_CONTEXT_ID`, shader sources)
  stay in the feature's own `constants.ts`; check every remaining consumer with `grep -rl
  <CONST_NAME> src` before moving vs. leaving behind, since moving a still-locally-used constant
  would just create the reverse problem the other way (feature reaching into `constant/` for
  something that isn't actually shared).

## Related

[[xigma-import-order]] — how imports from these files are grouped and ordered (`./types` **and**
`./enums` both get the `// types` header even via a relative path — confirmed in x-design's
`types/components/types.ts` importing `AlignmentHorizontal` from `./enums` under `// types`;
`./constants`/`./utils/*` fall under `// others` unless the alias is one of the recognized top-level
categories).
[[xigma-test-conventions]] — how tests for these utils/hooks are structured.
