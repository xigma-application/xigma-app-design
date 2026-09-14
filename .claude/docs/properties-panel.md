# RightPanel properties panel (`components/Design/RightPanel/PanelProperties`)

`PanelProperties.tsx` is a `switch (true)` router keyed on the active tool and the current
selection:

| condition | panel |
| --- | --- |
| frame tool active | `FrameTool/` |
| nothing selected | `NoSelection/` (Page background, Styles, Export, MCP) |
| single `NodeType.frame` | `Frame/` |
| single `NodeType.rectangle` | `Rectangle/` |
| anything else | `null` |

## `Common/` — shared between node panels

Sections that more than one node panel needs live in `PanelProperties/Common/`, not under any one
node's folder. Today:

- `Common/PanelHeader/` — `PanelHeader` wraps `UITools.ComponentHeader`. Given a `menu` prop it
  renders the label inside a `UITools.ButtonMenu` trigger (chevron + dropdown); without one it
  renders a plain label span. `PanelHeaderComponentButton` is the shared "Create component" button
  (`common.panelHeader.*` i18n).
- `Common/PositionSection/` — Alignment, Position, Rotation, plus the ignore-auto-layout toggle.
  Its hooks (`useColumnPosition`, `useColumnAlignment`, `useColumnRotation`,
  `buildRotationButtons`) gate on `isBoxSceneNode(selectedNode)` rather than
  `type === NodeType.frame`, so they work for any box scene node. `rotateNodesRigidly` takes a
  `TBoxSceneNode` for the same reason.
- `Common/ColumnDimensions/` — the W/H row (and, for frames, the Fixed/Hug/Fill sizing menu and
  min/max reveal, which stay hidden for a plain shape because `canHug`/`canFill` are false and the
  frame-only sub-hooks receive `undefined`). `useColumnDimensions` reads base geometry off the box
  node and keeps a `frameNode` narrowing only for the frame-specific pieces.
- `Common/ColumnGridChildSpan/` — Column span / Row span fields, shown only when the selected
  node's parent frame is `LayoutMode.grid` (`useColumnGridChildSpan`). Rendered after the W/H row
  in both the Frame and Rectangle panels; self-hides otherwise. **Display only so far** — the
  fields are uncontrolled and read `gridColumnSpan`/`gridRowSpan` (default 1) without committing.
- `Common/AppearanceSection/` — Opacity + Corner radius row, plus a Hide/Show eye button and a
  Blend mode button in the section header. Gates on `isAppearanceNode`
  (`type === NodeType.frame || NodeType.rectangle` — the only two types with a `cornerRadius`
  field today). `Opacity/useOpacity` reads/writes `node.opacity` (0-1 fraction, 0-100% in the UI).
  `CornerRadius/useCornerRadius` mirrors `ColumnPadding`'s merged/individual split: one field
  showing a shared value or "Mixed" (`Common/utils/getMixedOrValue`, a generic reusable helper —
  not corner-radius-specific) when the four corners differ on that single node, or a toggle
  (`IndividualInsets` icon, same as padding's) that reveals four independent fields
  (`cornerRadiusTopLeft/TopRight/BottomLeft/BottomRight`), each icon-coded with
  `BorderRadiusL/T/R/B` respectively (that naming does **not** match TL/TR/BL/BR — verified against
  Figma's own icon placement, not guessable from the SVG paths alone). Dragging a canvas
  corner-radius handle (`continueCornerRadiusDrag`) clears all four per-corner fields back to
  uniform, so canvas and panel never disagree about which mode is active. Once the individual view
  is open, its `buttonsIcon` also renders `CornerSmoothingButton` — a popover (slider + clamped
  percentage input, an "iOS" mark at 60%) reading/writing a single node-level `cornerSmoothing`
  (0-1 fraction, `CornerSmoothingPopover/hooks/useCornerSmoothingPopover`, same commit/clamp shape
  as `useOpacity`) that reshapes all four corners' curve at once — real geometry, not per-corner
  (`canvas-rendering-pipeline.md`'s corner-radius section). `AppearanceHeaderButtons/BlendModeButton/`
  opens a `UITools.Popover` (not `ButtonMenu` — it needs full open-state control, see below) listing
  every CSS/Figma-style blend mode (`BlendModeMenu`, options from `types/design/constants.ts`'s
  `BLEND_MODE_GROUPS`, grouped with `PopoverSeparator` exactly like the screenshot spec — Pass
  through/Normal, then the darken/lighten/contrast/component families, then the HSL family), each a
  `PopoverItem` with its own checkmark. State ownership sits at the **button**, not the menu —
  `useBlendModeButton` reads/writes the selected node's own `TBaseNode.blendMode?: BlendMode` via
  `updateNode` (same commit shape as `useOpacity`/`useCornerSmoothingPopover`), defaulting to
  `passThrough` when unset, and `BlendModeMenu` is purely presentational (`nodeId`/`onSelect`/`value`
  props) so the button can react to clicks on its own trigger without the menu ever mounting. Three
  behaviors layer on top of the plain read/write: (1) the trigger icon swaps `DropEmpty` ⇄
  `DropFilled` depending on `value !== passThrough`, with the tooltip swapping in lockstep
  (`tooltip.addBlendMode` / `tooltip.removeBlendMode` — a `tooltip.*` namespace, not nested under
  `blendMode.*`, since the user asked for it split out that way); (2) clicking the trigger while a
  real blend mode is set **doesn't reopen the menu — it resets to Pass through instead**, requiring a
  second click to actually reopen once back at the default. Both live entirely in `onOpenChange`, not
  a raw click handler: `UITools.Popover` is used in fully-controlled mode (`open`/`onOpenChange`) and
  Radix calls `onOpenChange(true)` on every trigger click regardless of the reason, so the hook just
  intercepts that callback (`nextOpen && !isDefault` → commit the reset, don't call `setOpen(true)`)
  instead of fighting Radix over `preventDefault` on a `UITools.Button` whose `onClick` prop is
  deliberately typed as a zero-arg `TFunc` (no native event ever reaches it) — the callback-level
  intercept works with that constraint instead of against it. (3) **Hovering** an option previews it
  live on the canvas without committing — `useBlendModeHoverPreview` (menu-side) writes
  `{ blendMode, nodeId }` onto a new ephemeral `refs.blendMode.previewRef` on `mouseenter`/clears it on
  `mouseleave` (each `PopoverItem` sits inside its own plain `<div>` wrapper carrying those handlers,
  rather than extending the shared `PopoverItem` component itself); `getNodeBlendMode.ts`
  (`canvas-rendering-pipeline.md` §11) now checks that ref before falling back to the node's own
  committed field, so the renderer can't tell a preview from a real value — same "ephemeral ref the
  render loop reads fresh every frame, never touches Redux" shape as every other in-progress/drag
  visual in this codebase. The button clears the ref itself whenever the popover closes for any
  reason (picking a value, clicking outside, the reset-click above), so a preview can never outlive
  its popover. The `BlendMode` enum + `BLEND_MODE_GROUPS` constant were deliberately put in the global
  `types/design/` layer (not nested under this button's own folder) because blend mode is a
  Design-domain concept other future features need the same option list for — per-fill blend mode on a
  single vector face is exactly that next feature (`TPaintBase.blendMode?: BlendMode`,
  `vector-network.md` §78's `Toolbar/VectorEditToolbar/VectorEditPaintTool/FaceBlendModeButton/`), built
  as a sibling of this button rather than a variant of it since its state lives on the live paint-tool
  state (`page.paint`) instead of a selected node. The eye button dispatches
  the pre-existing `toggleNodeHidden` (already cascades to descendants via
  `cascadeSetGroupChildrenFlag` — no new wiring needed there).

- `Common/FillSection/` — the Fill list: zero or more `TPaint[]` layers (first item = topmost,
  matching the vector paint stack's own ordering), each editable, reorderable and independently
  hideable/deletable, plus a header "Apply styles and variables" button
  (`ApplyStylesButton/`, `StylesAndVariables` icon — deliberately a no-op for now, the button and
  its icon exist ahead of the feature). Gates on `isAppearanceNode` (the same `TFrameNode |
  TRectangleNode` guard as `AppearanceSection`, imported from there rather than duplicated), so this
  is Rectangle- and Frame-only today — Ellipse/Star/Polygon/Section/Text keep their pre-existing
  single `fill: string`. Getting here required widening `TFrameNode`/`TRectangleNode.fill: string`
  to `fills: TPaint[]` in the type layer itself (a real data-model migration, not just new UI —
  `TSceneNodeChanges`, node creation in `dispatchShapeNode.ts`/`toolSettings.ts`,
  `convertFrameToSection`/`convertSectionToFrame`, and `convertRectangleToVector` all had to move
  from a single hex to a paint array or back, using the shared `utils/design/paint/makeSolidPaint`
  / `getSolidPaintColor` round-trip helpers); `convertRectangleToVector` now forwards the whole
  `fills` array as the new vector node's `defaultFill` instead of collapsing it to one solid paint,
  a fidelity improvement that fell out of the migration for free. Each row reuses
  `UITools.ColorPickerInput` in `simple` mode (solid-only — no gradient tab) for the swatch/hex/opacity/
  visibility cluster; a non-solid paint already sitting in `fills` (nothing in this UI creates one)
  renders a read-only gradient-preview swatch instead (`getNonSolidFillSwatchStyle`, angle derived
  from the paint's `start`/`end` via `utils/design/paint/getGradientAngleFromPoints` since a
  committed `TGradientPaint` has no stored angle, only endpoints) with its own eye toggle but no
  editing. Rendering the real fill (solid or otherwise) on the canvas is
  `canvas-rendering-pipeline.md`'s `drawBoxLeafNode`/`getBoxFillPolygon` section — the same GPU
  paint-stack pipeline vector faces already used, reused verbatim for a box's whole outline as a
  single "face".

  Drag reordering and click-selection are a deliberate 1:1 port of `GridSettings/GridTrackList`'s
  own mechanism (down to reusing its exact index-math shape), not a simplified one-off — this was a
  direct correction mid-build after a first pass shipped single-item-only dragging with no drop
  indicator and no selection highlight. `useFillSelection` mirrors `useGridTrackSelection` exactly
  (plain click replaces the selection and sets the shift-anchor; meta/ctrl toggles one index in;
  shift extends an inclusive range from that anchor; a `useEffect` drops any selected index once it
  falls outside a shrunken `fillCount`) and `useFillReorderDrag` mirrors `useGridTrackReorderDrag`
  (multi-index `sourceIndices`, a `dropIndex` computed each `pointermove` from every registered
  row's live `getBoundingClientRect()`, reported to the caller on `pointerup` whether or not the
  pointer actually moved). The one piece written fresh rather than ported is the actual array
  splice: grid tracks reject a non-contiguous drag outright (`isContiguous` in
  `commitGridAxisReorder.ts`, because linked grid cells can't reorder around a gap); a flat fill
  list has no such constraint, so `getFillReorderResult` moves an arbitrary (possibly
  non-contiguous) `sourceIndices` set to one insertion point in a single pass — sort the sources,
  pull them out, count how many sat before the insertion slot to re-anchor it, splice the moved
  block back in — and returns the block's new indices so the drag can re-select what it just
  moved. `resolveFillDragIndices` reproduces grid's "grab an unselected row → drag just that row,
  replacing the selection" vs. "grab a row already inside the selection → drag the whole selection"
  branch (`commitGridTrackReorder`'s `!hasMoved` case collapses back to a single-row selection even
  when nothing moved, so a press-and-release on one of several selected rows without dragging acts
  like a plain click). `useClearFillSelectionOnOutsideClick` is new, not ported — Grid never needed
  it (its selection lives inside a `GridSettingsHeader`-owned popover that closes/clears on its own)
  — a `mousedown` listener attached to `document` only while `selectedIndices.length > 0`, checking
  `containerRef.current.contains(event.target)` (same shape as
  `EditableInput/useEditableInputActionToggle`'s own outside-click check) so anywhere outside the
  Fill rows — including back on the still-selected canvas shape itself — drops the selection.
  Multi-select intentionally stays drag-only: editing a row's own hex/opacity/visibility/delete
  always acts on that one row's index regardless of how many rows are currently selected (mirrors
  Grid too — its per-row `onChangeValue`/`onDelete` are single-index the same way).

  Each row's `ColorPickerInput` also opts into a new `paintTypeRow` flag
  (`ColorPickerInput` → `ColorPicker` → `ColorPicker/PaintTypeRow/`), a row of icon buttons rendered
  between the header tabs and the body, meant to eventually switch the open fill between paint
  kinds (solid/gradient/image/video/pattern). Only a single, non-interactive "Solid" button exists
  so far (`Icon name="Solid"`, added to `@xigma/components` the same way as `StylesAndVariables`;
  its second, tinted path uses a distinct `data-svg-property="fill-ramp-400"`, wired up as a
  `$svg-fixed-properties` map entry in `@xigma/scss`'s `svg-color` mixin rather than a one-off CSS
  rule, so a future icon needing another fixed accent tone is just another map entry). Styled with a
  dedicated `--active` modifier (`background-color: var(--color-surface)`) instead of `UITools.Button`'s
  generic `selected` prop, since that one maps to the (differently-toned) `--color-bg-selected` token —
  this is intentionally not wired to anything yet. `paintTypeRow` defaults to `false` and is opt-in per
  call site: `FillRow` sets it, but the other two `simple`-mode `ColorPickerInput` consumers
  (`ColumnBackground`, `GradientPanel/StopsList/StopRow`) don't, so they don't gain this row just
  because they share `simple`.

  **A cross-portal `stopPropagation()` gotcha, found via live testing, not a test failure:** each
  row originally wrapped its `ColorPickerInput` (and its gradient-preview branch) in
  `<span onClick={stopRowSelectPropagation}>` to stop a click on the swatch/hex/opacity fields from
  also selecting the row (the row's own `onClick` sits on an ancestor `<div>`). That handler called
  `event.stopPropagation()` — which, because React's synthetic events call the underlying native
  `Event.stopPropagation()` too, silently broke outside-click dismissal for *any* Radix popover
  opened from inside that span: `ColorPicker`'s own popover content (and the nested paint-type/format
  `Dropdown` inside it) is portaled to `document.body`, but still bubbles through the React tree back
  to this span (React portals bubble via the React tree, not the DOM tree) — so a click meant to
  dismiss the nested popover by landing on a plain area of the open picker never reached the
  `document`-level listener Radix's dismissable layer relies on. Fixed by deleting the
  `stopPropagation()` handler entirely and instead having `useSelectFillRow`'s own click handler
  bail out via `event.target.closest('[data-no-select], [data-radix-popper-content-wrapper]')` — the
  first selector marks the (non-portaled) swatch/fields wrapper the same way `data-no-drag` marks a
  no-drag zone for `usePopoverDrag`; the second is Radix's own wrapper attribute, needed because a
  portaled click's real DOM ancestry never includes the row's `data-no-select` span, only whatever
  Radix actually rendered around it. `GridTrackRow` (the component this was ported from) has the
  exact same `stopRowSelectPropagation`-wrapped `UITools.Dropdown` pattern and is presumably exposed
  to the same bug, but that wasn't in scope here and wasn't touched. Root-caused (not just patched)
  with a real red→green e2e check: a Playwright test reproducing the exact repro (open the picker,
  open the nested format dropdown, click a plain area) was confirmed to fail against the reverted
  `stopPropagation()` code before the fix landed.

  The paint-type row also uncovered two shared-component bugs, both fixed at their actual root rather
  than patched in `FillRow`: (1) `Sampler` (the eyedropper trigger, `ColorPicker/Sampler/`) uses
  `UITools.ButtonMenu` purely to get open/closed state for its icon color — it never passes
  `children`, so `Popover`'s `PopoverPrimitive.Content` was mounting anyway as a visible-but-empty
  floating box. Fixed in the shared `Popover.tsx` itself (`{content && <PopoverPrimitive.Portal>...`)
  rather than replacing `ButtonMenu` in `Sampler` — the correct general rule is "no children, no
  popover," which benefits every other empty-content `ButtonMenu`/`Popover` caller too, not just this
  one. (2) The `SaturationMap`/`HueSlider`/`AlphaSlider` thumbs previously shared one
  `getThumbOffset(fraction, radiusPx)` util that inset the whole travel range by the thumb's own
  radius, so a thumb's *center* could never reach the true 0%/100% edge — only `SaturationMap` (a 2D
  square, corners visually read fine with the thumb's ring overflowing past the edge) needed that
  fixed; `HueSlider`/`AlphaSlider` (thin 1D bars) look broken with an overflowing thumb, so they kept
  the old inset math under a new, separately-named `getSliderThumbOffset.ts` (identical formula,
  `SLIDER_THUMB_RADIUS` restored in `ColorPicker/constants.ts`), while `SaturationMap` alone uses the
  simplified `getThumbOffset(fraction) => ${fraction * 100}%`.

  **The `PaintTypeRow` icon row is now functional** (not just the static "Solid" placeholder
  described above): a second "Gradient" icon was added (`Icon name="Gradient"`, same
  `xigma-app-shared` registration flow as `Solid`), and `PaintTypeRow` now takes `activeTab`/
  `onSelectTab` from `ColorPicker.tsx` — the SAME `handleSetActiveTab`/`useSetActiveTab` mechanism
  the plain-text Solid/Gradient `Header` tabs already used, just exposed as icon buttons instead
  (used in `simple` mode, where the text tabs are replaced by Custom/Libraries). Clicking Gradient
  switches `Body` to `GradientPanel` exactly like the vector Paint tool's own tab does.

  **Editing a gradient stop's own color needed a real layout fix, not a floating popover.** Each
  `StopRow` used to open its OWN nested `ColorPicker` popover for its swatch (positioned relative to
  the swatch itself, via Radix's default trigger-anchored floating-ui placement) — visually this
  meant the stop's color editor floated right at the tiny swatch icon, disconnected from the
  gradient panel that opened it. The ask was for it to *dock* flush against the gradient panel's own
  edge instead (two panels side by side, sharing a border, Figma-style) — **not** achievable through
  Radix's `Popover.Anchor`/`virtualRef` decoupling mechanism: multiple attempts (a virtual anchor
  pointing at the outer panel's DOM node, then a real `asChild`-wrapped fixed-position marker div at
  the outer panel's measured rect) both produced a correctly-computed anchor rect (verified via
  direct browser console logging) that Radix's own floating-ui integration nonetheless never
  actually applied — `--radix-popper-anchor-width/height` on the resulting content wrapper stayed
  `0px` regardless, and the panel kept rendering pinned to the viewport's top-left corner. Given a
  "docked, always in the same place relative to its parent" panel is fundamentally a static-layout
  problem, not a floating-anchor problem, the actual fix drops Radix positioning for this one case
  entirely: `ColorPicker.tsx` owns a `dockedPanel: ReactNode` state slot rendered as an
  absolutely-positioned sibling (`.ColorPicker__docked`, `position: absolute; right: 100%; top: 0`,
  requiring `.ColorPicker` itself to be `position: relative`) inside its own 240px panel box, and
  exposes a setter through a new `DockedPanelContext` (`ColorPicker/DockedPanelContext.ts`) so a
  deeply-nested descendant (`StopRow`, 4 levels down through `Body`/`GradientPanel`/`StopsList`) can
  push arbitrary content up into that slot without prop-threading through every intermediate
  component. `ColorPickerInput` gained a new `onTriggerClick?: TFunc` escape hatch — when given, the
  swatch renders as a plain button calling it instead of opening its own nested `ColorPicker`
  popover — and `StopRow` uses it to call `setDockedPanel` with a new `StopColorPanel` component
  (`StopRow/StopColorPanel/`, wraps the existing `SolidPanel` + `ColorSampler` + its own
  `useColorModel`/`useColorSampler` instances, plus a close button) instead. This is a real,
  general-purpose mechanism now, not a one-off hack: any future "detached editor panel that must
  dock to its own parent panel rather than float near whatever small control opened it" case in
  `ColorPicker` can reuse the same `DockedPanelContext` slot.

  **A gradient fill on Rectangle/Frame is now actually editable, with on-canvas handles and a
  working rotate.** Previously a non-solid `fills[]` entry rendered as the dead, read-only swatch
  described above — `FillRow`'s non-solid branch now type-switches three ways: `solid` keeps
  `ColorPickerInput`, `image` keeps the old static swatch (image editing stays out of scope), and any
  `gradient-*` paint renders a new `GradientFillControl` (`FillRow/GradientFillControl/`) that opens
  the real `UITools.ColorPicker` directly (same call shape `VectorEditPaintTool` already used),
  seeded with `initialActiveTab={ColorPickerTab.gradient}` and a new `initialGradient={{start, end,
  stops}}` prop so the panel reflects the paint actually being edited instead of always resetting to
  `DEFAULT_GRADIENT_STOPS`. Its `onGradientChange`/`onChange` write a real `TGradientPaint`/
  `TSolidPaint` straight back through the existing `onChange(index, paint)` → `commitFills` →
  `updateNode({changes:{fills}})` path already used for solid fills — no new commit mechanism needed.

  Rotate previously only worked for the vector Paint tool, which converts an abstract `angle` through
  a 4-entry `getGradientPointsFromAngle` lookup (0/90/180/270 only, lossy). `useGradientPanel` now
  supports a second, parallel internal mode: when constructed with `initialGradient`, it tracks real
  `{start, end}` points instead of `angle`, and `rotate()` rotates those two points 90° around the
  normalized center `{0.5,0.5}` (`hooks/useRotateGradient.ts`, via `utils/math/rotatePoint`) — real
  geometry, not a quantized lookup. The vector tool's own `useSetGradientPaint` consumer is
  untouched: it still gets `angle` back (points-mode is simply never engaged when `initialGradient`
  isn't passed), so nothing about its existing flow changed. `TGradientPanelChange` grew optional
  `start`/`end` fields to carry this without touching the angle-mode shape at all.

  `useGradientPanel.ts` (`Body/GradientPanel/hooks/useGradientPanel/`) is a promoted-hook folder
  (per `xigma-module-structure`): the hook itself is just `useState` wiring, and each action
  (`addStop`/`removeStop`/`setStopPosition`/`setStopColor`/`flip`/`rotate`/`setType`) is its own
  hook under `hooks/useGradientPanel/hooks/`, taking the exact reactive state/setters/`onChange` it
  needs as params and returning the handler — mirroring the existing `useSelectFillRow`/
  `useSetPaint`-style "hook that returns one closure" pattern already used elsewhere in this repo.
  There is deliberately no separate `utils/` layer of one-line pure functions here — each hook's own
  computation (the nearest-stop lookup, the sort-by-position, the point rotation) lives inlined in
  its own file's body; the only files that stayed genuinely shared (used by more than this one hook)
  are `GradientPanel/utils/getGradientStopsCss.ts` and `translations`.

  **The on-canvas gradient handles** are a new `drawGradientHandleLayer` (`Canvas/hooks/
  useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/`), modeled directly on the sibling
  `drawEllipseArcHandleLayer/` folder shape (flat files + nested `test/`). It draws, for a
  `gradient-linear` paint only (radial/angular/diamond and dragging the handles are explicitly out of
  scope for now): the start→end line (`drawGradientLine`), a round handle at each endpoint
  (`drawGradientEndpointHandles`), and one square per stop (`drawGradientStopHandles`) positioned via
  `lerp(start, end, stop.position)` with a small perpendicular offset so the swatch doesn't sit on
  top of the line — colored to the stop's own color, highlighted blue when it matches the currently
  selected stop. World-space math (`getGradientWorldPoints.ts`) follows the exact same pattern as
  `getEllipseArcValueLabelAnchor.ts`: map the paint's normalized 0..1 `start`/`end` into the node's
  unrotated local bounds, then `rotatePoint(..., node.rotation)` around the bounds center.

  The one real architectural question this raised: the draw loop is imperative (reads Redux + mutable
  refs each frame), but "a gradient is being edited, for which node/paint/stop" lives in the
  `ColorPicker`'s own React component state, several component layers above the canvas. Rather than
  inventing a new ref-based bridge, this reuses the existing `editingNodeId`-style precedent: a small
  transient `design.gradientEditor: {nodeId, paintIndex, selectedStopIndex} | null` slice field (a
  plain `setGradientEditor` reducer, explicitly **not** included in `getDesignSnapshot` — undo/redo
  should never restore "which gradient panel happened to be open"), written via a `useEffect` in
  `GradientFillControl` (`hooks/useSyncGradientEditor.ts`) while its picker is open on the Gradient
  tab, cleared on close/unmount. `ColorPicker` itself stays fully Redux-agnostic — it only gained a
  generic `onGradientPanelStateChange?: {isGradientTabActive, selectedStopIndex}` callback
  (`hooks/useNotifyGradientPanelState.ts`); the Redux write happens one level up, in the Fill-section-
  specific `GradientFillControl`, not in the shared `ColorPicker`/`GradientPanel` components.

  **The on-canvas handles became fully interactive** (hover cursor + a `%` value label that follows
  the stop, click-to-select, click-and-drag to reposition, and click-on-the-line to insert a new
  stop) in a later pass — still scoped to `gradient-linear` only, still leaving the vector Paint
  tool's own separate gradient flow untouched. Hit-testing and hover both go through the same two
  ordered-array dispatch tables every other canvas tool uses (`ARM_RESOLVERS`/`HOVER_RESOLVERS`,
  first match wins): `armGradientStopOnPointerDown`/`armAddGradientStopOnPointerDown` (in that
  order — an existing stop must always win over "add a new one here") and, in parallel,
  `resolveGradientStopHover`/`resolveGradientLineHover`. Stop-vs-line priority is additionally baked
  into the geometry itself as a second line of defense: `getGradientLinePositionAtPoint.ts` calls
  `getGradientStopHandleAtPoint.ts` first and bails to `null` on a hit, so the line can never steal a
  click or hover meant for a stop even if a resolver-ordering change is made in the future.

  Dragging a stop is tracked by **color+opacity fingerprint, not array index**
  (`TGradientStopDragState = {color, draggedStopIndex, nodeId, opacity, paintIndex}` in
  `types/design/canvas/types.ts`, held in a new `gradientStop.gradientStopDragRef` — its own
  `useGradientStopRefs`/`createGradientStopRefs` folder under `useCanvasRefs/hooks/`, the same shape
  as `useEllipseArcRefs`). This is required because `paint.stops` must stay position-sorted for the
  shader's `sampleGradient` loop to render correctly, so a cross-over drag re-sorts the array mid-drag
  and shifts every later stop's index; `continueGradientStopDrag.ts` re-finds the dragged stop each
  frame by matching color+opacity against the stop nearest the drag's last known position, rather
  than trusting a stale index.

  Two Radix-`Popover` interactions with this new canvas surface needed explicit fixes, both in
  `ColorPicker.tsx`'s `onInteractOutside` handler (composed via `useHandleInteractOutside` from
  `useIgnoreSamplerInteractOutside` + a new `useIgnoreGradientCanvasInteractOutside`, driven by a
  `isPointerOverGradientHandle?: TFunc<[], boolean>` prop threaded down from `FillRow` via
  `useIsPointerOverGradientHandle.ts`, which just checks whether any of the three gradient hover/drag
  refs are non-null):
  - Clicking a stop landed on the `<canvas>`, which Radix's dismissable-layer treats as "outside" the
    popover's React tree, closing it. Fixed narrowly — only swallow the outside-click when the pointer
    is actually over a gradient handle/line, not for every canvas click (a real click on the shape
    itself must still close the picker, by design).
  - Even with that fix, drag-then-release-off-the-handle still closed the popover. Root cause (found
    by reading `@radix-ui/react-dismissable-layer`'s source directly): when the initiating `pointerdown`
    lands outside the popover, Radix doesn't dismiss synchronously — it defers to a one-time `click`
    listener that fires *after* `pointerup`. Any ref cleared synchronously on `pointerup` is already
    stale by the time that deferred check runs. Fixed in `disarmGradientStopDrag.ts` by clearing
    `gradientStopDragRef` inside a `setTimeout(0)` instead of inline.

  **Adding a stop by clicking the guide line** reuses the exact same stop-handle visual for its hover
  preview (`drawSingleGradientStopHandle.ts`, extracted so both `drawGradientStopHandles.ts` and the
  new `drawGradientAddStopPreview.ts` share one draw function instead of a plain placeholder dot),
  offset above the line by the same `STOP_HANDLE_OFFSET_PX` real stops use, and colored via a new
  `getInterpolatedGradientColor.ts` (linear RGB+opacity blend between the two bracketing stops,
  clamped to the first/last stop outside the stops' own range) rather than the nearest stop's raw
  color — so clicking to add a stop never visibly changes the gradient. `armAddGradientStopOnPointerDown`
  uses the same interpolation to color the actual persisted stop it inserts.

  Two bugs unrelated to this new interactivity, found and fixed while building it: (1) the
  `sampleGradient` GLSL loop (`vectorGradientFillFragmentShaderSource.ts`) seeded its out-of-range
  fallback color as always `u_stopColors[0]`, so dragging the last stop inward left the remaining
  range rendering the *first* stop's color instead of clamping to the *last* one — fixed by picking
  the fallback based on which side of the range `t` falls on. (2) the docked panel's own
  `GradientBar` thumb-drag used native per-thumb `setPointerCapture`, which is silently released
  whenever the thumb's DOM node is reordered (which happens on every frame while dragging past
  another stop, since thumbs are re-sorted by position) — the drag would visibly "steal" onto the
  wrong thumb mid-gesture. Fixed by tracking the drag via a stable ref (`draggingStopIdRef`) plus
  `window`-level `pointermove`/`pointerup`/`pointercancel` listeners instead of capture.

  The docked panel's stop list is `TEditableGradientStop[]` (has a React-key `id`, panel-local,
  never persisted) while Redux holds plain `TGradientStop[]` (no id) — adding a stop from the canvas
  changes Redux only, so the two representations drift out of sync. `useSyncExternalStopChanges.ts`
  (new hook under `useGradientPanel/hooks/`) reconciles them on any external stop-count change: it
  matches each incoming external stop against the current local list by
  `position`+`color`+`opacity` to preserve existing ids (never regenerating an id for a stop that
  didn't change, which would remount that stop's `StopRow`/`GradientBar` thumb), assigns a fresh
  `nanoid()` only to a genuinely new stop, and selects that new stop automatically.

  **Dragging the line's own start/end endpoint rotates the whole gradient**, continuously, directly
  on the canvas — separate from the discrete 90°-at-a-time panel rotate button described above. The
  model (locked with the user before implementing, since it's real geometry): grabbing either
  endpoint and dragging rotates the line as a rigid body around the shape's bounds center, not just
  that one point — both `paint.start` and `paint.end` are recomputed every frame as the two opposite
  intersections of a line through the center with the (unrotated, local) bounding box edge, so the
  handles visibly slide around the shape's perimeter as the angle changes. Two new pure-geometry
  utilities carry this: `utils/canvas/getRectPerimeterPointAtAngle.ts` (global — given a rect and an
  angle, the point where a ray from its center exits the rectangle boundary; genuinely
  domain-generic, so it lives beside the existing `getRectPerimeterPoint.ts` rather than under
  `Canvas/utils/`) and `Canvas/utils/getGradientEndpointsAtAngle.ts` (gradient-specific: calls the
  above twice, at `angle` and `angle + π`, for the two opposite edge points).
  `Canvas/utils/getGradientAngleFromPoint.ts` is the inverse — given a world point, returns the
  continuous angle from the bounds center, unrotating by `node.rotation` first via `rotatePoint`
  exactly like `getRotateCursorAngle.ts` already does for the node's own corner-rotate handles.
  `continueGradientRotateDrag.ts` ties these together each pointermove: compute the angle toward the
  cursor, get both edge points at that angle, then assign whichever one matches the *dragged*
  endpoint (`draggedEndpoint: 'start' | 'end'` in the new `TGradientRotateDragState`) to the point at
  the raw angle (so it tracks the cursor) and the other to the point at `angle + π` — this is what
  keeps a drag on `end` from silently swapping the gradient's own direction.

  Hit-testing, hover, and drag-arming for these endpoints mirror the exact same
  refs-group/hover-prepass/arm-resolver/continue/disarm pattern the stop-drag and add-stop-on-line
  features already established (`getGradientRotateHandleAtPoint.ts`, a dedicated
  `useGradientRotateRefs` folder holding `gradientRotateDragRef`, `resolveGradientRotateHandleHover`
  + `resolveGradientRotateHover` wired into the same `HOVER_RESOLVERS`/pre-pass list, and
  `armGradientRotateOnPointerDown` inserted into `ARM_RESOLVERS` right after the stop resolver and
  before the add-stop-on-line one — stop > rotate > add-line is the full priority order now, each
  later hit-test explicitly bailing via the earlier one, same defensive double-encoding as before).
  The rotate hit radius reuses the exact same 10px-ish tolerance idiom as the stop radius, just its
  own constant (`GRADIENT_ROTATE_HANDLE_RADIUS_PX`), confirmed by the user as fine as-is (it isn't a
  ring restricted to outside the shape like the node's own corner-rotate zone — a plain radius around
  the endpoint, since the endpoint already sits on the shape's edge).

  The cursor while hovering/dragging a rotate endpoint **reuses the node's own existing 4-quadrant
  cursor system verbatim** — `getRotateCursorAngle` + `getRotatedCursorUrl('rotate', …)`, the same
  two functions `resolveRotateHover.ts` already uses for the selection box's corner-rotate handles.
  This was a deliberate explicit correction mid-session: an early draft computed a continuous cursor
  angle from the endpoint's exact position instead (smoother in theory), but the user rejected it —
  the requirement is specifically the same coarse 4-position snap as corners, not a continuous one,
  "based on the starting position," so the continuous variant (`getGradientRotateCursorAngle.ts`) was
  deleted again without ever being wired in.

  A new **angle-following label** (`drawGradientRotateAngleLabel.ts`) shows the gradient's current
  `${Math.round(angle)}°` right beside the cursor while hovering or dragging a rotate endpoint —
  computed live each frame from the paint's actual current `start`/`end` world points via the
  existing `getAngleBetweenPoints`, not from a value cached at drag-start, so it's correct on both the
  hover-only and actively-dragging paths (merged in `drawGradientHandleLayer.ts` exactly like
  `activeStopIndex` already merges hover vs. drag state). Positioning this one needed a different
  technique than the stop/add-preview labels: those anchor to a fixed point in world space with a
  small world-unit margin baked into the anchor itself
  (`getGradientStopValueLabelAnchor.ts`'s `EXTRA_MARGIN_PX`), but "follow the mouse" needed the label
  anchored exactly at the live pointer position with **no added manual offset** — `drawValueLabel`'s
  shared badge-geometry helper already bakes in its own fixed 28px gap by default
  (`VALUE_LABEL_OFFSET_PX`, `getValueLabelBadgeGeometry.ts`), which reads as "far" for a
  mouse-following label; passing `edgeGapPx` in `drawValueLabel`'s options overrides that default
  with a gap measured from the *badge's near edge* instead of its center, giving a small, precise,
  tunable distance from the cursor (currently `EDGE_GAP_PX` in `drawGradientRotateAngleLabel.ts`) —
  this override existed in the shared component already but nothing had used it until this label
  needed a genuinely tight gap.

  **The rotate pivot itself is one of two modes, decided once at drag-start and frozen for the whole
  gesture** (locked with the user before implementing — this was the trickiest part of the whole
  feature). Mode selection: both endpoints must touch the shape's bounding-box edge, and on *distinct*
  walls specifically (`getTouchedRectEdges.ts` — global `utils/canvas/`, returns the *set* of walls a
  point touches, since a corner touches two at once; `isPointOnRectPerimeter.ts` is now just
  `getTouchedRectEdges(...).size > 0`) — sharing only the same single wall does **not** count, even
  though each point independently "touches an edge." Confirmed by the user with a concrete
  counter-example: two points both sitting on the top edge, at different x, must *not* behave like a
  true corner-to-corner span. If distinct walls are found, the drag stays in **`'box'` mode**; if
  either endpoint is off the edge entirely, or both share one wall, it switches to **`'line'` mode**
  (pivot = the line's own frozen midpoint, radius = half its own frozen length —
  `getGradientEndpointsAroundPivot.ts`). The mode itself is decided once at
  `armGradientRotateOnPointerDown.ts` and never re-evaluated mid-drag (the user explicitly rejected
  re-checking every frame, to avoid the pivot jumping mode under the cursor mid-gesture).

  **A real, reported regression inside `'box'` mode itself, found after shipping the above:** the
  first version always measured both endpoints' angles from the *box's own geometric center* — correct
  only when the gradient's start/end already straddle that center symmetrically (e.g. a true corner
  diagonal, which always passes through the center by construction). For a line that touches two
  distinct walls *without* passing through the center — the user's own repro: both endpoints on the
  bottom edge, one at the bottom-left corner, one at the bottom-right corner, i.e. a horizontal line
  along the bottom, nowhere near the vertical center — the very first rotate frame forced the whole
  line onto a through-center configuration, snapping the untouched endpoint to a wildly different spot
  ("wygląda jak reset pozycji żeby trzymały się środka"). The fix keeps measuring both angles from the
  box center (still always safely interior, never degenerate the way an off-center pivot can be — see
  below), but freezes an **angle offset** at arm-time
  (`getGradientRotateAngleOffset` in `armGradientRotateOnPointerDown.ts`): the actual gap between the
  non-dragged endpoint's real starting angle and what naive antipodal symmetry (`draggedAngle + 180°`)
  would predict. Each continue-frame, the other endpoint's angle is `draggedAngle + 180° + angleOffset`
  instead of a bare `+ 180°` — for a true diagonal, `angleOffset` comes out to (a multiple of) `0°` so
  behavior is bit-for-bit unchanged; for the bottom-edge case it preserves the line's own 90°-ish
  subtended angle throughout the whole gesture, so it rotates continuously with no jump, exactly the
  "kijek" (stick through the center) mental model the user described — just generalized to a line that
  isn't a full diameter. An earlier attempt at this same fix computed a *frozen pivot point* (the
  line's own original midpoint) and cast rays from *that* to the box edge
  (`getRectBoundaryPointFromPoint.ts`, `getGradientEndpointsFromPivot.ts`) — mathematically sound for
  most angles, but degenerate whenever that frozen pivot itself sits exactly on a wall (exactly the
  bottom-edge case!): the antipodal ray, pointing back into the same wall the pivot already touches,
  collapses to zero length. The center-with-frozen-offset approach sidesteps this entirely since the
  box center is never on a wall; `getGradientEndpointsFromPivot.ts` was deleted again once this was
  found, but `getRectBoundaryPointFromPoint.ts` stayed — `getRectPerimeterPointAtAngle.ts` is now just
  a call to it with `origin` fixed at the box center, so the general "ray from an interior point to the
  rect boundary" primitive is still there for the box-center case (`radius` still varies per-angle for
  a non-square box, unlike the fixed-radius `'line'` mode).

  `getGradientAngleFromPoint.ts` gained an optional `pivot` parameter (defaults to the bounds center)
  so the same function serves both modes — it still always un-rotates the cursor's world point by
  `node.rotation` around the bounds center first (rotation is always physically anchored there,
  regardless of which conceptual pivot the gradient math uses), then measures the angle from whichever
  pivot was asked for.

  **A smart guide snaps the line to exactly horizontal or vertical** while dragging, in either mode
  (`getGradientRotateSnapAngle.ts`: within 3° of a 0/90/180/270 multiple, replace the raw angle with
  the exact snapped one before computing the endpoints). This reuses the app's existing alignment-guide
  *rendering* pipeline verbatim — `refs.transform.alignmentGuideRef` and its `TAlignmentGuide`
  type/`drawAlignmentGuide.ts` draw function are already wired unconditionally into `drawScene.ts`
  (originally built for snapping a dragged shape's edge to a sibling shape's edge), so no new drawing
  code was needed: `continueGradientRotateDrag.ts` just writes a `TAlignmentGuide` into that same ref
  when snapped (`getGradientRotateAxisGuide.ts` builds it — a guide segment spanning the shape's full
  width/height through the pivot, rotated into world space by `node.rotation` since everything
  upstream of it is computed in the node's unrotated local frame) and clears it to `null` otherwise;
  `disarmGradientRotateDrag.ts` clears it unconditionally on release, mirroring `disarmDrag.ts`'s own
  existing clear for the ordinary move-drag case.

  **Grabbing right on an endpoint moves it freely instead of rotating** — a third, innermost
  interaction, added after the user pointed out the rotate-only version left no way to just
  reposition a point. The three interactions are concentric rings around each endpoint, exactly
  mirroring the existing node corner's resize-vs-rotate handoff (`CORNER_HANDLE_SIZE` /
  `ROTATE_HANDLE_OUTER_RADIUS_PX`, `isInRotateRing.ts`): a tight **move** zone
  (`GRADIENT_ENDPOINT_MOVE_RADIUS_PX = 6`, `getGradientEndpointMoveHandleAtPoint.ts`) wins first, an
  outer **rotate** ring (`GRADIENT_ROTATE_HANDLE_RADIUS_PX = 10`, now checked as an annulus —
  `distance > innerRadius && distance <= outerRadius` — in `getGradientRotateHandleAtPoint.ts`, which
  imports the move radius as its inner exclusion) applies beyond that, and the line-hit-test for
  adding a new stop bails on both. This full 4-level priority (stop > move > rotate > add-line) is
  wired into both `ARM_RESOLVERS` and `HOVER_RESOLVERS` in that exact order, plus the usual
  hover-pre-pass/bail-on-higher-priority double encoding every earlier gradient interaction in this
  file already uses. The move cursor reuses the *same* CSS class (`'positioning'`, `positioner.png`)
  the gradient **stops** already use — dragging a point freely is the same kind of interaction
  either way, so it gets the same cursor, not the rotate one.

  Moving is deliberately the simplest math in the whole gradient-editing feature: the dragged
  endpoint's normalized position is set directly to the (unrotated) cursor position —
  `continueGradientEndpointMoveDrag.ts` — with **no effect at all on the other endpoint** (unlike
  rotate, which always moves both). The point is **not** clamped to 0..1 — it can travel outside the
  shape's own bounds, matching Figma (an earlier version of this feature clamped to 0..1; the user
  explicitly asked for it to be removed). Nothing downstream assumes 0..1: `getGradientWorldPoints`
  is a plain lerp that works for any value, the endpoint hit-test/hover only cares about the world
  point's distance from the cursor, and the snap-to-landmark logic below is per-axis and only
  triggers near 0/0.5/1 regardless of how far out the raw value can go. While moving, each axis
  independently snaps to 0/0.5/1 — the shape's own edges and center —
  (`getGradientMoveSnapPoint.ts`, tolerance in px converted per-axis since bounds width/height
  usually differ) and the same shared `alignmentGuideRef`/`TAlignmentGuide` pipeline the rotate
  angle-snap already established gets a second producer, `getGradientMoveSnapGuide.ts`: it can show
  **both** a horizontal and a vertical guide line at once (e.g. snapping exactly onto a corner),
  since `TAlignmentGuide`'s two fields are independently nullable — something the single-axis
  rotate-angle guide never needed. `toNormalizedGradientPoint.ts` (the raw
  world-point-to-0..1-relative-to-bounds conversion) was promoted from a rotate-drag-local helper to
  a shared `Canvas/utils/` function once this second consumer needed the identical math.

i18n for the shared sections lives under `…panelProperties.common.*`.

## `Frame/`

`Frame.tsx` = `FrameHeader` (its own `FrameHeaderMenu` with section/preset items +
`FrameHeaderButtons` = HTML-tag toggle + the shared component button, all passed into
`Common/PanelHeader`) → `Common/PositionSection` → `LayoutSection/` (flow, dimensions from
`Common/`, grid child span from `Common/`, min/max, alignment/gap/grid, padding, clip-content —
the auto-layout-specific rows, frame-only) → `Common/AppearanceSection` → `Common/FillSection`.

## `Rectangle/`

`Rectangle.tsx` = `RectangleHeader` (`Common/PanelHeader` with the label only + the shared
component button, no dropdown) → `Common/PositionSection` → a bare `UITools.Section` labelled
"Layout" holding `Common/ColumnDimensions` + `Common/ColumnGridChildSpan` → `Common/AppearanceSection`
→ `Common/FillSection`. No auto-layout rows.

## Adding a panel for another node type

1. Route it in `PanelProperties.tsx`.
2. Compose it from `Common/` sections; move any section that a second panel now needs from the
   node folder into `Common/` (keep the i18n keys under `…panelProperties.common.*`) and widen its
   hooks' node-type gate to `isBoxSceneNode`.
3. Add `…panelProperties.<node>.*` i18n, a `<Node>.spec.tsx`, and an e2e in
   `e2e/design/panels/` if the panel drives canvas geometry (dimension/position edits do).
