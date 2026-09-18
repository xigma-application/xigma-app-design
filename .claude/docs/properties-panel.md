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
  changes Redux only, so the two representations drift out of sync. Originally reconciled by a
  narrower `useSyncExternalStopChanges.ts` (only on a stop-*count* change); superseded by
  `useSyncGradientPanelWithLivePaint.ts` — see the "canvas ↔ popover sync" follow-up below for why
  that widening became necessary, and for the general form of the same
  `position`+`color`+`opacity` id-preserving reconciliation described here.

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

  **Radial gradients get the same start/end handles as linear, plus one extra "radius" handle.**
  `gradient-radial` paints already existed as a `TGradientPaint['type']` value (reusing the exact
  same `start`/`end`/`stops` shape as linear), but had zero on-canvas editing and a shader model
  where the visual center was the *midpoint* of start/end (radius = half their distance) — neither
  point was actually the center. This was changed so `start` is the true center (radius =
  `|end - start|`, `t = 0` exactly at `start`), matching Figma and matching what a "center point"
  should mean; this is a rendering-visible change for any pre-existing `gradient-radial` paint; the
  vector Paint tool's own gradient rendering shares the same shader/draw function
  (`drawVectorGradientFill.ts`) so this fix applies there too.

  A brand new field, `TGradientPaint.radiusRatio?: number` (default `1` when absent — a perfect
  circle), scales a *second*, always-perpendicular radius, making the shape an ellipse.
  `getGradientRadiusHandleNormalizedPoint.ts` computes that handle's position purely in the paint's
  own normalized (0..1, bounds-relative, anisotropic) space — `start + perpendicular(end-start) *
  |end-start| * radiusRatio` — deliberately *not* in true screen-pixel space, so the handle always
  lands exactly on the shader's own iso-line regardless of the shape's aspect ratio (the shader
  computes distance in that same anisotropic space too, so a non-square shape already renders an
  ellipse even at `radiusRatio = 1` — this is intentional, matching Figma). Dragging it
  (`continueGradientRadiusDrag.ts`) is locked to that perpendicular axis by construction: the raw
  cursor position is projected onto the perpendicular direction via `getGradientRadiusRatioFromPoint.ts`
  and only that scalar component becomes the new ratio (any component along the primary start→end
  axis is ignored) — no rotation/skew is possible from this handle, per an explicit product decision
  (Figma allows some skew here; this app deliberately doesn't, to keep the model simple). The ratio
  is **not** clamped to an upper bound (same "let it travel freely" philosophy as endpoint move) but
  is floored at a small epsilon (`MIN_RADIUS_RATIO = 0.01`) so it can never collapse the ellipse to a
  zero-width line, which would make the handle un-graspable again.

  Reuse vs. new code, concretely: `getGradientStopHandleAtPoint`, `getGradientEndpointMoveHandleAtPoint`,
  `getGradientLinePositionAtPoint`, `continueGradientStopDrag`, `continueGradientEndpointMoveDrag`, the
  arm resolvers for stop/move/add-stop, and `drawGradientHandleLayer`'s main branch all had their
  `paint.type === 'gradient-linear'` guard widened to a shared `isLineHandleGradientPaint(paint)`
  predicate (`paint.type === 'gradient-linear' || 'gradient-radial'`) — every one of those
  interactions (drag a stop, move an endpoint, click the line to add a stop) is literally identical
  math for radial as for linear, since both are driven by the same `start`/`end`/`stops`. The
  dragging `start` (the center) moves only that point, exactly like linear's move — deliberately
  *not* translating the whole gradient, an explicit product decision made when the model was locked
  with the user before implementing this. The radius handle itself is entirely new (own refs group
  `gradientRadius`/`useGradientRadiusRefs`, own arm/continue/disarm trio, own hover resolvers), with
  hit-test priority stop > move > **radius** > line, checked after move so a hovered move-zone always
  wins the (rare) overlap case. It is drawn as a **lone point only** — `drawGradientEndpointHandles`
  reused for it, but *not* `drawGradientLine`: an explicit user correction ("nie ma sensu niech sobie
  jakby w powietrzu niby wisi" — it doesn't make sense, let it just hang in the air) after the first
  version connected it to the center with the same white line the start/end axis uses, which read as
  a second gradient axis rather than a standalone scale control. While the radius handle is actively
  being dragged (`refs.gradientRadius.gradientRadiusDragRef` matches the current node/paint),
  `drawGradientRadiusGuide.ts` draws a temporary line from the center to the handle in the same
  orange (`ALIGNMENT_GUIDE_STROKE`, `#cd4422`) used by ordinary alignment/snap guides elsewhere,
  plus a small crosshair at each end — this only appears mid-drag (the "does it make sense to
  visually connect them" question is different while the user is actively manipulating the radius vs.
  at rest, per explicit feedback), it does not itself imply real snapping (there is none for the
  radius handle currently).

  **Radial does get its own rotate, after all** — an initial version left the rotate ring
  linear-only, reasoning that free-moving `end` already sets both angle and magnitude in one motion.
  The user pushed back: they also wanted a dedicated *fixed-radius* rotate, reachable from **either**
  the center's own ring or the edge point's own ring, always pivoting at the center. Implemented by
  widening `getGradientRotateHandleAtPoint.ts`'s existing dual-ring check (already shared via
  `isLineHandleGradientPaint`) rather than writing a separate radial-only hit-test, and adding a
  third `TGradientRotateMode` value, `'radial'`, to the existing box/line dispatcher in
  `continueGradientRotateDrag.ts` (`getRadialModeFrame`). Because the center never moves in this
  mode, arming is endpoint-agnostic: whichever ring is grabbed (`getGradientRotateHandleAtPoint`
  still reports which one, for the angle-label hover), `armGradientRotateOnPointerDown.ts` always
  freezes `pivot = local start` and `radius = |local end - local start|` and always sets
  `draggedEndpoint: 'end'`, since the edge point is the only one that ever actually moves. No angle
  snapping was added for this mode (an explicit product decision — linear's box/line rotate still
  snaps to axis angles via `getGradientRotateSnapAngle`, radial's does not).

  **Switching gradient type resets the points to that type's own default**, rather than carrying
  over whatever `start`/`end` the previous type had. Before this, `useSetGradientType` always
  forwarded the panel's existing `points` state unchanged, so e.g. a linear gradient's arbitrary
  diagonal line would be reinterpreted as-is under `gradient-radial`'s new "start = true center"
  model — putting the center wherever `start` happened to be (often off in a corner), not at the
  visual middle of the shape. Fixed with a small per-type default table baked into
  `useSetGradientType.ts` itself (only one caller, so no new top-level util): non-radial,
  non-angular types (linear, diamond) get the existing horizontal default (`{start: (0,0.5), end:
  (1,0.5)}`); `gradient-radial` **and** `gradient-angular` both get `{start: (0.5,0.5), end: (0.5,
  1)}` — true center, radius reaching the bottom edge, matching Figma's own default for both (see
  "Angular reuses the radial ellipse handles" below for why angular needed the center model too).
  The hook now also calls `setPoints` (previously it only forwarded to `onChange` and let the
  type-switch's points go stale in local state), so every subsequent edit in the same session (add a
  stop, drag a stop) keeps using the freshly-reset points instead of silently reverting to whatever
  was there before the switch.

  **Angular reuses the radial ellipse handles wholesale, with one different rule: stops move by
  angle, not by lerp along the line.** `isLineHandleGradientPaint` (gates the whole handle overlay)
  was widened again to `'gradient-linear' || 'gradient-radial' || 'gradient-angular'`; a new sibling
  predicate `isEllipseHandleGradientPaint` (`'gradient-radial' || 'gradient-angular'`) replaced every
  `paint.type === 'gradient-radial'` literal that gated the third radius/aspect handle and its drag
  (`drawGradientRadiusHandles`, `armGradientRadiusOnPointerDown`, `continueGradientRadiusDrag`,
  `getGradientRadiusHandleAtPoint`) and the rotate-mode dispatch (`armGradientRotateOnPointerDown`'s
  `'radial'`-mode branch) — angular's center (`start`), rotate-from-either-ring, and radiusRatio
  aspect handle are now byte-for-byte the same interactions as radial's, since none of that code ever
  cared which of the two paint types it was. The one thing that *couldn't* be reused: a stop's
  `position` on an angular gradient is an angle around the ellipse (matching the shader's
  `atan2`-based `t`), not a linear fraction of the start->end segment — dragging a stop, hit-testing
  it, and rendering its marker each needed an ellipse-angle counterpart alongside the existing
  line-lerp math, dispatched on `paint.type === 'gradient-angular'` at each of the three call sites:
  `continueGradientStopDrag` (new `getGradientStopDragPosition` local helper calls the new
  `getPositionAroundGradientEllipse(normalizedPoint, start, end, radiusRatio)` instead of
  `getPositionAlongGradientLine`), `getGradientStopHandleAtPoint` (calls the new
  `getGradientAngularStopHandlePositions(bounds, rotation, paint)` instead of
  `getGradientStopHandlePositions`), and `drawGradientHandleLayer` (same positions function, plus a
  per-stop outward-direction array — `getGradientRadialOutwardDirection(stopPosition, center)` per
  stop instead of one shared `awayFromLineDirection`, since each angular stop sits at its own angle
  around the ellipse rather than all beside the same line; `drawGradientStopHandles` and the
  active-stop value-label helper both took a `TPoint[]` instead of a single `TPoint` for this).
  `getGradientAngularStopNormalizedPoint(paint, position)` is the forward map (position -> point on
  the ellipse, in the same start/perpendicular/`radiusRatio` basis `getGradientRadiusHandleNormalizedPoint`
  already used) and `getPositionAroundGradientEllipse` is its inverse — both live in normalized
  (0-1, bounds-relative) space specifically so they line up with the shader's own `u_start`/`u_end`
  space, not local pixel space (see the shader change below for why that space choice matters).
  Deliberately **not** extended to angular: `getGradientLinePositionAtPoint` (click-the-line-to-
  add-a-stop) — every point on the start->end segment maps to the same angle (0), so a linear-lerp
  "position" computed from click-offset-along-the-line would be geometrically meaningless for
  angular; it now checks `'gradient-linear' || 'gradient-radial'` explicitly instead of the widened
  predicate, so angular gradients simply don't get canvas add-stop-by-click (still addable via the
  panel's own stop list). Nothing needed to change for the "ellipse allowed outside the frame" case
  the user specifically called out — no gradient handle code anywhere clamps `start`/`end`/the radius
  handle to the node's bounds, so angular got that for free by inheriting the same drag code.

  **The shader's angular branch changed to match this "center" model, and it now honors
  `radiusRatio` too.** Before this, `vectorGradientFillFragmentShaderSource.ts`'s angular branch
  computed its angle around `center = (u_start + u_end) * 0.5` (the *midpoint*) — a leftover from
  when angular still used the same "two opposite edge points" default as linear. Once angular's
  default (and its on-canvas handles) switched to the radial "start = center" model, that midpoint
  math would have visually decoupled the rendered gradient's true center from where the on-canvas
  center handle actually sits. Changed to mirror the radial branch exactly: pivot at `u_start`,
  project onto the primary axis (`u_end - u_start`) and its perpendicular, and divide the
  perpendicular component by `u_radiusRatio` before the `atan2` — an ellipse-warped sweep instead of
  a perfect circle, reducing to the original formula when `radiusRatio` is 1 (the default), so every
  existing angular gradient renders unchanged. `drawVectorGradientFill.ts`'s
  `paint.type === 'gradient-radial' ? radiusRatio : 1` uniform gate widened to include
  `'gradient-angular'` to match.

  **Diamond had the same "two opposite points" bug the angular fix above describes, except it was
  never actually fixed for diamond — a shape with a diamond fill rendered as almost solid flat
  color instead of a diamond.** Diamond's shader branch computed `halfSize = abs(u_end - center)`
  where `center = (u_start + u_end) * 0.5`, expecting `u_start`/`u_end` to be two *opposite
  corners* of the diamond's bounding box (so `halfSize` gets a nonzero x **and** y component). But
  diamond's default points were still the linear "two opposite edge points on the same horizontal
  line" default (`start: (0, 0.5)`, `end: (1, 0.5)`) — with those, `center` lands at `(0.5, 0.5)`
  and `halfSize` is `(0.5, 0)`: a zero y-extent. Dividing by that (clamped to `0.0001`) made `t`
  enormous everywhere except a thin horizontal band, so `sampleGradient` clamped almost the whole
  fill to the last stop's color. Fixed the same way angular was: diamond now pivots at `u_start`
  (the center) like radial/angular, projects onto the primary axis and its `radiusRatio`-scaled
  perpendicular exactly like the radial branch, but sums the two components with `abs(a) + abs(b)`
  (L1/Manhattan distance) instead of `length(vec2(a, b))` (L2/Euclidean) — that's the only
  difference between an ellipse and a diamond in this basis. `getDefaultGradientPoints` in
  `useSetGradientType.ts` and the `radiusRatio` uniform gate in `drawVectorGradientFill.ts` both
  widened their `'gradient-radial' || 'gradient-angular'` checks to include `'gradient-diamond'` to
  match, so switching a gradient to Diamond now seeds a proper centered default instead of the
  broken flat line. Diamond did **not** get on-canvas handles as part of this render fix —
  `isLineHandleGradientPaint`/`isEllipseHandleGradientPaint` deliberately still excluded it at this
  point, since it has no ellipse-guide equivalent of its own (a rotated-square/rhombus guide); that
  followed as a separate change, see below.

  **Follow-up: diamond got the full radial handle set, confirmed by the user to follow "the same
  rules as radial."** Unlike angular, diamond's `stop.position` is a plain linear lerp fraction
  along the start->end line, identical to linear/radial (`continueGradientStopDrag`,
  `getGradientStopPositions`, `getGradientStopDirections` all branch only on
  `paint.type === 'gradient-angular'` — diamond already fell into their shared, non-angular
  branch) — so no new position/direction math was needed, only widening the two gating predicates:
  `isLineHandleGradientPaint` (whole handle overlay, rotate-handle hit-test, click-add-stop) and
  `isEllipseHandleGradientPaint` (the 3rd radiusRatio/aspect handle, its drag, and the `'radial'`
  rotate-mode dispatch in `armGradientRotateOnPointerDown` — fixed pivot at center, both endpoints
  swing together, no box/line-attach snapping) both widened to
  `'gradient-radial' || 'gradient-angular' || 'gradient-diamond'`. `getGradientLinePositionAtPoint`
  (click-the-line-to-add-a-stop) also widened the same way it already had `'gradient-radial'` added
  — every point along a diamond's line maps to a sensible lerp position, unlike angular.
  Deliberately **not** widened: `drawGradientEllipseGuide.ts` keeps its own narrower
  `isEllipseShapedGradientPaint` check (`'gradient-radial' || 'gradient-angular'` only) instead of
  reusing the now-wider `isEllipseHandleGradientPaint` — a diamond's actual iso-color boundary is a
  rhombus, not an ellipse, and the reference screenshot for diamond's default state showed no
  boundary guide at all, so drawing an elliptical curve over it would be actively misleading; a
  diamond-shaped guide is left as a future addition if the user asks for one specifically.

  **Bug found along the way, affecting angular too, not just diamond:** `useConvertSolidToGradientPaint`
  (the single function every `GradientPanel` `onChange` — including a plain stop-color edit —
  funnels through before it reaches Redux) only preserved `radiusRatio` when
  `type === 'gradient-radial'`. Since it re-derives `radiusRatio` from scratch on *every* panel
  change, not just on a type switch, editing a stop's color on an angular gradient with a non-1
  `radiusRatio` (set earlier by dragging the aspect handle) silently reset it back to 1 on the very
  next keystroke — angular had this bug live before diamond's own handles even existed. Fixed by
  widening the same condition there too (`'gradient-radial' || 'gradient-angular' || 'gradient-diamond'`
  on both the incoming `type` and the existing `paint.type`).

  **The ellipse itself was never actually drawn as a curve** — the radial pass (and angular after
  it) only ever rendered the straight start→end line, the point handles, and the stop markers; a
  user comparing against Figma's reference UI pointed out the missing oval outline that visually
  connects them. Fixed with a new `drawGradientEllipseGuide.ts`, called unconditionally from
  `drawGradientHandleLayer.ts` (it decides for itself, internally, whether the paint has an ellipse
  to draw via `isEllipseHandleGradientPaint` — a no-op for linear). Rather than approximating a true
  axis-aligned ellipse (which would be wrong for a rotated gradient on a non-square node — the
  primary and secondary axes aren't generally orthogonal once you scale x/y independently by the
  node's own width/height), it samples `ELLIPSE_SEGMENTS` points around the curve using the exact
  same parametric formula the shader and the angular stop math already use — `getGradientEllipsePoint`
  (renamed from `getGradientAngularStopWorldPoint`, and its normalized-space counterpart from
  `getGradientAngularStopNormalizedPoint` to `getGradientEllipseNormalizedPoint`, once it became a
  shared primitive rather than an angular-stop-only one) — and connects consecutive points with the
  same thick-line-quad `drawLine` technique (shadow pass + white stroke) `drawGradientLine.ts`
  already uses, rather than a native `GL_LINE_LOOP` (whose width can't be scaled with zoom). Guaranteed
  by construction to pass exactly through the primary axis endpoint (`end`) and the radius handle
  (both are just this same function evaluated at specific `position` values), so the curve always
  lines up with the existing point handles, never drifts independently of them.

  **Gradient stop markers now offset perpendicular to the line, not always straight up, and rotate
  to match it.** `getGradientStopHandlePositions.ts` originally nudged every stop by a fixed
  `(0, -offset)` — correct-looking only for a near-horizontal line (linear's usual default), and a
  real, reported bug for radial's new default vertical line: offsetting a point on a vertical line
  purely in y just slides it further along that *same* line, so the stop marker still visually sat
  exactly on top of the guide instead of beside it. Fixed with a new shared
  `getGradientPerpendicularOffsetDirection(start, end)` (one of the two 90° rotations of the
  start→end vector, chosen so it reduces to the historical `(0,-1)` for a horizontal line — no visual
  change for any existing near-horizontal linear gradient) used everywhere a stop-adjacent element
  needs to know "which way is away from the line": the stop position offset itself, the little
  connecting pointer triangle's anchor/orientation (`drawGradientStopPointer.ts`, generalized from a
  hardcoded "always points down" triangle to one built from an arbitrary `direction` vector — base
  perpendicular to it, tip along it), the value-label's extra margin
  (`getGradientStopValueLabelAnchor.ts`), and the "add stop" hover preview's offset position, all of
  which previously hardcoded the same "up" assumption independently. A first attempt reversing only
  the position-offset formula (leaving the pointer triangle hardcoded "down") caused a real runtime
  crash (`drawGradientAddStopPreview.ts` had its own separate, easy-to-miss call into
  `drawSingleGradientStopHandle` that wasn't updated for the new parameter) and, before that, a test
  regression where a rotate-ring hit-test's hardcoded grab-point coordinate happened to land on a
  stop that had moved — both are the kind of "one direction number touches many call sites" trap this
  kind of change invites; grep every consumer of the changed function before considering it done, not
  just the ones the type-checker complains about.

  On top of the position fix, the user asked for one more thing: the stop's backdrop/border/swatch
  squares (`drawSingleGradientStopHandle.ts`) should **rotate** so one edge sits parallel to the
  line, instead of always staying axis-aligned regardless of the line's angle (visually, an
  axis-aligned square offset from a steep diagonal line doesn't read as "belonging" to it the way a
  square rotated to match the line's angle does). `drawRect` already accepted a `rotation` (degrees,
  around the rect's own center by default) that every call here had been passing `0` for; now it's
  `atan2(towardLineDirection.y, towardLineDirection.x)` in degrees. Since these are all perfect
  squares, only the rotation *mod 90°* is visually distinguishable, so no sign/direction convention
  needed to be agonized over — any of the four equivalent right-angle offsets looks identical.

**Three more GradientPanel bugs, all traced to the same root cause: `useGradientPanel`'s local
state is a working copy seeded once from the paint, not a live mirror of it.** `useGradientPanel.ts`
(`stops`/`selectedStopId`/`angle`/`points`/`type`) is plain `useState`, seeded from the
`initialGradient` prop only on mount and re-seeded only by one narrow effect: reopening the popover
(`useResyncGradientPanelState.ts`, formerly `useResetGradientPanelOnReopen.ts`). Anything else that
changes the paint out from under the open panel — switching to Solid, an undo/redo, or (see the
follow-up further below) a canvas-driven edit — left this local state stale.

- **Switching to Solid didn't reset the gradient state**, so switching back to Gradient in the same
  popover session resurfaced the old paint's stops/type/points instead of starting fresh. Since this
  is a direct, local interaction (clicking the Solid tab), it's fixed at the interaction site rather
  than with another watch-effect: `useGradientPanel` now also returns a `reset()` (new
  `useResetGradientPanel.ts`, the same five-setter reset body `useResyncGradientPanelState` already
  had, factored out so both can call it), and `useSetActiveTab.ts` calls it directly in its
  solid-tab branch, right next to the existing `onChange(value)` call.

- **Undo/redo didn't refresh the open panel at all** — not the stops, not even the type dropdown.
  First fixed narrowly with a `design.historyRevision` counter bumped only by `replaceDesignSnapshot`
  (what `undo`/`redo` dispatch) — then superseded a session later by the general
  canvas-sync mechanism below, which covers undo/redo as just one more kind of "external change" and
  made the counter dead weight, so it (and its `selectHistoryRevision` prop-threading) was removed
  again. See the follow-up section for the mechanism that replaced it and why.

- **Continuous drags inside the gradient panel spammed one history entry per pixel** — the
  begin/end-gesture coalescing pattern (`beginHistoryGesture`/`endHistoryGesture`,
  `store/history/actions.ts` — a pending pre-drag snapshot is only actually pushed once per gesture,
  see `createHistoryStack.ts`'s `snapshotPushedThisGesture`) already covered the Solid panel and
  every canvas drag, but `onDragStart`/`onDragEnd` simply never reached the Gradient tab: `Body.tsx`
  only forwarded them to `SolidPanel`, not `GradientPanel`. Threaded them all the way through
  `GradientPanel` → `GradientBar` (wired into `useGradientBarDrag`'s existing thumb
  pointerdown/window-pointerup handlers) and → `StopsList` → `StopRow` (its own alpha
  `ScrubbableInput`, plus forwarded again into the docked `StopColorPanel` → `SolidPanel`, so a stop's
  saturation-map/hue/alpha drags coalesce the same way the main fill's do). All new props are
  optional and additive, so the vector Paint tool's gradient flow (`VectorEditPaintTool.tsx`, which
  already passes its own `onDragStart`/`onDragEnd` into the same shared `ColorPicker`) picked up the
  same fix for free. `useGradientBarDrag`'s `onDragEnd` is now guarded on "was a drag actually in
  progress" before calling it — not required for correctness (`endGesture()` is a no-op if no gesture
  is open) but avoids firing it on every unrelated pointerup while the bar is visible.

  E2E gotcha worth remembering: sending `Control+z` while focus sits on `GradientActions`' own type
  dropdown *trigger button* does nothing — the shared `Dropdown` component swallows the keydown
  itself. Any e2e test that needs global keyboard shortcuts to reach the app while a dropdown was
  just used must click something else inert first (e.g. the "Stops" label) to move focus off the
  trigger.

**Follow-up: canvas ↔ popover live sync, and why the `historyRevision` counter above got removed
again.** Two more reports, both really the same gap: (1) rotate/move a linear gradient's line *on
the canvas*, then drag a stop *inside the still-open popover* — the line snaps back to its original,
un-rotated position/angle. (2) drag a stop's position *on the canvas* while the popover is open — the
popover's own stop-position field never updates to show it. Root cause: `historyRevision` only
covered `replaceDesignSnapshot` (undo/redo); a canvas-driven gradient drag dispatches the exact same
`updateNode` action type the panel's own edits use (via `commitFills`), so there was no signal at all
distinguishing "an external actor changed this paint" from "my own edit is echoing back" for that
case — the panel's stale local `points`/`type` just kept winning every time it was touched next.

The general fix, in a new `useSyncGradientPanelWithLivePaint.ts` (replacing the older, narrower
`useSyncExternalStopChanges.ts`): resync `points`/`type`/`stops` from the live `initialGradient` prop
on *every* render where any of them actually differ from local state — unless the popover's own drag
is currently in progress. The gate is the key piece that keeps this from becoming a "two sides both
think they're the source of truth" loop (Redux and local state can otherwise fight forever, each
correcting the other one render late): a new `useTrackIsDragging.ts` wraps the `onDragStart`/`onDragEnd`
callbacks `ColorPicker.tsx` already
receives (the same ones used for history-gesture coalescing above) in an `isDraggingRef`, passed down
into `useGradientPanel`. While `isDraggingRef.current` is true, the sync effect is a no-op — the
panel's own in-progress drag is trusted as the freshest source, uncontested — and only once the drag
ends does the *next* genuinely-different live value (if any) get picked up. Every other panel
interaction (rotate button, flip, type switch, add/remove stop, position/hex field commit-on-blur)
already calls `onChange` synchronously in the same handler that updates local state, so by the time
this effect runs, Redux and local state agree already — the resync is a real no-op for those, not
just a gated one, confirmed by `stateRef`-based reads that avoid stale-closure re-runs.

This also made the `historyRevision` counter redundant: undo/redo is just another kind of "external
change" the same mechanism now catches, since the popover is never "dragging" (from its own
perspective) when a keyboard shortcut fires. Removed `design.historyRevision`,
`selectHistoryRevision`, and the `historyRevision` prop threaded through
`FillRow`/`ColorPickerInput`/`ColorPicker` — keeping two overlapping "is this external?" signals
around would only have confused the next reader. One test-writing trap worth flagging: a `renderHook`
callback that builds its `initialGradient` argument as a fresh inline object literal recreates it
(and its nested `stops`/`start`/`end`) on every re-render regardless of whether anything really
changed, unlike the real app's Redux-backed prop (which only gets a new reference when the
underlying paint actually changes) — a test written against a static/frozen `initialGradient` while
calling a local-only mutator like `reset()` will see the sync effect "correct" the local change right
back, since nothing marks that frozen value as stale. The fix is in the test, not the code: use
`renderHook`'s own `rerender` to advance `initialGradient` the same way the real prop would (e.g. to
`undefined` right after `reset()`, mirroring `useSetActiveTab`'s Solid-branch actually turning the
paint solid in the same interaction).

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

## `ImageCrop/`

**Routed ahead of every node-type panel, not by node type at all.** `PanelProperties.tsx`'s switch
checks `useIsEditingImageCrop()` (`Boolean(selectSelectedImageCrop(state))`, i.e.
`imageEditor?.selectedTarget === 'image'`) before its `NodeType.frame`/`NodeType.rectangle` cases, so
whichever node actually owns the image — Frame or Rectangle today, any future `isAppearanceNode` type
later, per the "będzie potem używane przez wiele innych" ask that drove this — gets swapped out for
`ImageCrop.tsx` the instant the user selects the image itself (as opposed to the frame) inside crop
mode (`canvas-rendering-pipeline.md`'s "second independently-editable entity" section). Clicking the
frame again flips `selectedTarget` back to `'frame'` and the panel reverts automatically, with no
`ImageCrop`-specific logic needed for that direction — it's just the same `PanelProperties` switch
re-evaluating.

**Deliberately minimal composition, built as a genuinely separate panel rather than a conditional
branch inside `Frame`/`Rectangle`** (an explicit ask, so the two stay untouched and any future panel
can route into `ImageCrop` the same way): `ImageCropHeader` (a plain "Image" label, no dropdown, no
buttons — `PanelHeader` with `menu` and `buttons` both omitted/`null`) → `ImageCropPositionSection`
(`Common/PositionSection/ColumnPosition` + `ColumnRotation` directly, deliberately **not**
`Common/PositionSection` itself, so `ColumnAlignment` never renders — alignment is meaningless for a
crop rect) → `ImageCropDimensionsSection` (a bare `UITools.Section` labelled "Layout", wrapping
`Common/ColumnDimensions` unmodified). Every one of those reused `Column*` components already reads
`selectSelectedImageCrop` itself and switches its own value/commit path when it resolves — this panel
supplies no new field-level logic, only the assembly and the header swap.

**Dimensions gained two new imageCrop-aware behaviors this session, on top of `useColumnDimensions`'s
pre-existing `imageCrop ? imageCrop.crop.width : node.width` value switch**: the aspect-ratio lock
(`ColumnDimensionsButtonIcons`' `AspectRatio` toggle) is now forced `locked: true` and `disabled` via
a new `lockDisabled` field whenever an image crop is being edited — a crop's own proportions should
always stay fixed when resized from the panel, unlike a node's optional lock. This exposed a real
dead branch: `commitColumnWidth`/`commitColumnHeight`'s `imageCrop` path
(`commitImageCropDimensions`) had never read any `locked` flag at all, so editing width while a crop
was active always left height untouched regardless of the (until-now-always-`false`) lock state.
Fixed by running the crop's width/height through the same `getLockedDimensionsChanges` ratio math the
node path already uses, with `locked` hardcoded `true` for this branch only.

**The Rotation row's Flip buttons only became imageCrop-aware this session — Rotate already was.**
`buildRotationButtons.tsx` had `rotateImageCropRigidly` wired for the "Rotate 90°" button from
earlier work, but Flip horizontal/vertical still unconditionally called `handleFlipSelection`
(flipping the underlying node) and were disabled/enabled purely off the frame's own
`isLayoutContainerNode` check — so clicking Flip while editing an image crop silently flipped the
wrong target. Fixed with a new `flipImageCropRigidly.ts` (the flip counterpart to
`rotateImageCropRigidly.ts`, toggling the paint's own `flipX`/`flipY` directly rather than touching
crop geometry) and `isFlipDisabled = imageCrop ? false : (!node || isLayoutContainerNode(node))`, so
the buttons are unconditionally enabled and crop-targeted whenever an image crop is open, regardless
of what the underlying frame's own layout state would otherwise say.

**Panel-driven transforms deliberately stay coupled to the frame; only a canvas drag decouples
them** — the opposite default from what you'd guess given the canvas-side work. Editing X/Y or
Dimensions from this panel, or clicking the Rotate 90° button, moves/resizes/rotates the crop
*together with* the frame (`rotateNodesRigidly`/the node-geometry commit paths have no
`imageEditor`-skip guard), matching Figma and confirmed directly by the user ("tak też działa to w
Figmie") — only a canvas rotate-handle or resize-handle *drag* on the frame itself decouples the crop
(`canvas-rendering-pipeline.md`'s frame/image independence section). This was a real regression
caught live: an early pass made `rotateNodesRigidly` skip the crop unconditionally whenever
`imageEditor.mode === 'crop'`, since that function is also the canvas-rotate-drag's own dispatch path
— but it turned out to be **only** the panel's call path, the canvas drag uses a separate
`continueRotateDrag.ts` function entirely, so the guard was reverted here and kept solely on the
canvas-drag side.

**Gotcha, found live right after `ImageCrop.tsx` shipped**: swapping the whole top-level panel
component on every `selectedTarget` change unmounts and remounts `FillRow` (the Frame/Rectangle
panel's own, via `Common/FillSection`) — and `FillRow` is the sole owner of `useSyncImageEditor`,
whose cleanup effect used to clear `imageEditor` unconditionally on unmount. Selecting the image
(swap *into* `ImageCrop`, unmounting `FillRow`) or clicking back to the frame (swap *out of*
`ImageCrop`, remounting a *fresh* `FillRow` whose local `isPickerOpen`/`isImageTabActive` state starts
at `false`) both looked, to that hook, exactly like "the picker closed for real" — silently exiting
crop mode on every single target switch. Fixed two ways at once: the unmount cleanup now checks
`selectSelectedNodes(store.getState())` and only clears when the node is genuinely no longer selected
(not just displayed via a different panel), and a `wasActiveRef` flag tracks whether *this specific
hook instance* ever actually activated the editor, so a fresh mount that lands on an
already-`imageEditor`-active node doesn't immediately clear it just because its own local toggle state
hasn't caught up yet.

**Follow-up bug, found live after the gotcha above was fixed**: `imageEditor` itself no longer got
wrongly cleared, but the fill *picker popover* (`FillRow`'s `ColorPickerInput`) still came back
**closed** every time `selectedTarget` left `'image'` — whether by clicking the frame again or by
fully exiting crop mode via Escape/click-outside — because `isPickerOpen`/`isImageTabActive` are
`FillRow`'s own local `useState`, and a fresh mount always starts them at `false`, same root cause as
the gotcha above, one layer further out (the *hook's* state survived the swap; the *component's* own
UI-open state didn't). Fixed by a new redux marker, `imageFillPickerFocus: {nodeId, paintIndex} |
null` (`store/design/types.ts`/`slice.ts`/`selectors.ts`, plain reducer, excluded from
`TDesignSnapshot` the same way `imageEditor` is), set/cleared by `useSyncImageEditor` in the exact
same branches it already sets/clears `imageEditor` — but critically **not** touched by the
canvas/Escape exit call sites (`armImageCropOnPointerDown.ts`, `armImageCropPaintOnPointerDown.ts`,
`handleLeave.ts`), so it survives every one of those. `FillRow` seeds its own `isPickerOpen`/
`isImageTabActive` from a match against this marker at mount, and threads a new `initialOpen` prop
down through `ColorPickerInput` into `ColorPicker`, which now seeds its own `isOpen` from it and
passes `open={isOpen}` to `Popover` — converting that `Popover` from Radix-uncontrolled to
explicitly React-controlled (behavior-preserving for every other caller, since `isOpen` already
mirrored every real open/close via `handleOpenChange` beforehand, just wasn't fed back in).

Explicitly decided with the user (not inferred): reopening the picker this way must **not** re-arm
`imageEditor` when the exit was a true close (Escape/click-outside) — the crop handles should stay
gone from canvas, only the picker's own visibility comes back showing the last state. Clicking the
frame is the one exception where re-arming is harmless/correct, since `imageEditor` was never nulled
there in the first place (only `selectedTarget` changed) — restoring the picker for that case is a
no-op re-dispatch of the same state. Implemented via a `skipInitialArm` param on `useSyncImageEditor`,
computed once per `FillRow` mount as the same boolean used to seed `isPickerOpen`.

**Real regression caught only by e2e, not by `renderHook`**: the first implementation stored the skip
as a "consume on first use" ref (`if (skip) { skip = false } else { arm }`), which passed every unit
test — `renderHook` doesn't wrap in `StrictMode` by default — but failed in the actual (StrictMode
-wrapped, `main.tsx`) app: React 18 dev mode double-invokes a fresh mount's effects
(mount → cleanup → mount again) to surface missing-cleanup bugs, and since refs (unlike state)
survive that phantom cycle, the *fake* first pass silently spent the one-shot skip, so the *real*,
kept effect run armed anyway — reopening the picker after Escape immediately re-armed crop mode,
undoing the exit. Fixed by making the skip a **window** that only closes on a genuine close
transition (the same branch that already nulls `imageEditor`/the marker for real), rather than being
spent by merely being read once — so any number of repeated invocations with the same still-open
props (StrictMode's replay or otherwise) keep skipping consistently. Covered by a dedicated unit test
that renders the hook inside an explicit `<StrictMode>` wrapper (`useSyncImageEditor.spec.tsx`) so
this can't regress silently again, plus two e2e cases in `fill-section.spec.ts` (frame-refocus and
Escape) that this exact bug's first fix attempt failed.

**Follow-up bug, much bigger than it first looked: no two fill-row popovers ever had real mutual
exclusion.** `ColorPicker`'s `isOpen` only ever *seeds* once from `initialOpen` — nothing outside it
can tell an already-open popover to close later, and `ignoreDismissWhileImageTabActive` additionally
blocks Radix's own outside-click dismissal while a row is on the Image tab (intentionally — canvas
interactions like a crop drag must survive it). Two attempted fixes made this *worse* before landing
on the real one: a `key`-based forced-remount raced React 18 StrictMode's double-invoked effects and
Radix's own dismissable-layer handling, closing both fills' popovers at once instead of just the
stale one; a `forceCloseSignal` prop toggling Radix's `open` state fixed that race but depended on an
unmemoized `handleOpenChange` in its effect deps, so once a fill was force-closed once it could never
reopen again (the effect re-fired on every unrelated render forever, snapping it shut).

The actual fix, after the user explicitly asked for "kill the instance, not signals": `FillSection`
owns one `openPickerIndex: number | null` (`hooks/useFillSection/hooks/useOpenPickerIndex/`), seeded
at mount from `imageFillPickerFocus` so the resuming-after-ImageCrop-swap case still works. Each
`FillRow` computes `isPickerOpen = paintIndex === openPickerIndex` — a **derived** value, not local
state, so at most one row can ever satisfy it. The genuinely new piece: `ColorPickerInput` already had
an `onTriggerClick` escape hatch (used by `StopRow.tsx` to swap its own popover for one docked
elsewhere) that renders a plain, static swatch button instead of mounting `ColorPicker`/`Popover` at
all. `FillRow` passes `onTriggerClick={isPickerOpen ? undefined : () => onPickerOpenChange(true)}` —
a closed row renders *no* `ColorPicker` component whatsoever (unmounted, not merely hidden); the row
that owns `openPickerIndex` renders the real thing, freshly mounted with `initialOpen={isPickerOpen}`
(always true at that point). Switching fills is therefore a plain unmount-of-old/mount-of-new via
React's own reconciliation (different element types in the same JSX slot) — no `key`, no signal, no
custom close mechanism, and no possible way for two instances to coexist.

One more bug this surfaced: `FillRow`'s own `isImageTabActive` is local state, fed by
`onImageTabActiveChange` from the (now sometimes-unmounted) `ColorPicker` — once a row's picker
unmounts because another one took over, that callback stops firing and `isImageTabActive` stays
frozen at whatever it last was. If the row was on the Image tab (e.g. Tile mode), `useSyncImageEditor`
never sees `isImageTabActive` go false, so its deactivate branch never fires and the global
`imageEditor` state stays stuck showing the fill that's no longer even open. Fixed with a small
`useDeactivateImageTabOnPickerClose.ts`: resets `isImageTabActive` to `false` the moment
`isPickerOpen` goes false. See `test-cases-panels.md` #487/#488 for the full history, including the
two discarded intermediate attempts.

**Right-panel-click parity with canvas-click for exiting the Image editor.** Clicking the canvas
while `imageEditor` is active already exits it via a dedicated canvas-pointerdown resolver
(`armExitImageEditorOnPointerDown.ts`), but clicking elsewhere in the right panel (Position, Opacity,
any non-fill field) did nothing. Added `useExitImageEditorOnPanelClick.ts` alongside the existing
`useClearFillSelectionOnOutsideClick.ts` in `useFillSection`'s hooks — same shape (a `window`
`mousedown` listener gated on whether there's anything to clear), but scoped to "outside the fill list
container, *and* inside the right panel" via `event.target.closest('[class*="RightPanel_"]')`. The
right-panel check is load-bearing, not decorative: without it, a canvas click (also "outside the fill
list") would double-fire this hook alongside the canvas's own resolver, risking an unwanted exit
mid-interaction. `RightPanel.tsx`'s CSS-module class comes out flat as `_RightPanel_<hash>_<n>` in
this project's build — not the doubled `RightPanel_RightPanel` shape `ColorPicker`'s own BEM-nested
classes (`ColorPicker`/`ColorPicker__popover`, independently hashed) happen to have; the first attempt
assumed the latter and the e2e test caught it immediately.

The hook mirrors canvas's own two-stage click behavior (first click exits the editor and keeps the
panel open, per the pre-existing "two-stage" test above; a second click goes further), not a single
combined action: it takes both `isImageEditorActive` and `isPickerOpen` (`openPickerIndex !== null`,
per the popover-exclusion mechanism above) and, on each right-panel click, does at most one of
`onExitImageEditor`/`onClosePicker` — the editor takes priority, so the very next click after exiting
never also closes the picker in the same gesture; the picker only closes once the editor is *already*
inactive. This was a real gap the user caught live: the first version only handled the editor-exit
half, so a follow-up right-panel click (with the editor already null) did nothing and the picker
stayed stuck open.

**The biggest bug of this whole cluster: `useSyncImageEditor`/`useSyncGradientEditor`/
`useSyncPatternSourcePickTarget` never checked ownership before clearing their shared global state.**
Reported live by the user with a precise repro: three image fills, each already carrying its own
committed crop; clicking 0 → 1 → 2 correctly enters crop mode each time, but clicking back to 0 or 1
afterward lands on `imageEditor: null` — crop mode simply doesn't work anymore. Root cause: each of
these three hooks runs once per `FillRow`, and their deactivate branch (and unmount cleanup)
unconditionally dispatched `null` whenever *this* row's own `isPickerOpen`/`isImageTabActive` went
false — with no check that the shared editor/focus/target state still actually belonged to *this*
row. When switching from a higher-index fill to a lower-index one, both rows' `isPickerOpen` flip in
the *same* render commit (they're both derived from one shared `openPickerIndex`), and React runs
effects in tree order: the lower-index row's activate effect fires first and correctly claims the
state, but the higher-index row's deactivate effect fires *after* it in the same flush and
unconditionally nulls whatever is there — clobbering the fresh claim. The user's own diagnosis,
verbatim: "jakby wyższy fill rozpieprza niższy" (as if the higher fill wrecks the lower one).

Fixed identically in all three hooks: before dispatching `null`, read the current value back
(`selectImageEditor`/`selectGradientEditor`/`selectPatternSourcePickTarget` via `store.getState()`)
and only clear it if it still matches *this* row's own `(nodeId, paintIndex)`. `useSyncImageEditor`'s
version of this check was pulled into its own function,
`useSyncImageEditor/utils/clearOwnedImageEditorState.ts` (used from both its deactivate branch and
its unmount cleanup, which had the identical duplicated ownership-check logic — the user's own
"wyciągnij to do funkcji" catch), which also prompted promoting `useSyncImageEditor.ts` from the flat
`FillRow/hooks/` folder into its own `useSyncImageEditor/` folder per the "hook with its own utils
gets its own folder" convention.

A real trap in testing this: a naive `renderHook` test that mounts fill 1, then *separately*
`renderHook`s fill 0, then reruns fill 1's `rerender` does **not** reproduce the race — each of those
is its own `act()` flush, sequential rather than interleaved, so it can pass even against the
unfixed code. The only way to genuinely exercise the same-commit ordering is a single composite hook
that calls both rows' `useSyncImageEditor` unconditionally (mirroring how `FillSection` renders every
`FillRow` every time) and changes which one is "active" via *one* shared prop in *one* `rerender` —
see `useSyncImageEditor.spec.tsx`'s last test for the pattern. The first attempt at this test used the
sequential/separate-`renderHook` shape and passed against both the buggy and fixed code, which would
have shipped as coverage that could never catch a regression.

**The `ImageCropToolbar` zoom slider (canvas toolbar, not this panel — documented here because it
shares `ImageCrop`'s crop-geometry vocabulary).** `ImageCropToolbar.tsx` already rendered a "Crop"
label + compact `Slider`, but it was a pure UI shell — local `useState`, no store read/write. Figma's
own docs don't document the slider's mechanics (only an inaccessible community feature-request
thread), so the user supplied the spec directly — and it took three live corrections after the first
`AskUserQuestion`-locked version to land on the real one:

1. First locked (via `AskUserQuestion`): 0% = the paint's Fill/**cover** size, anchor = the frame's
   own geometric center. Implemented and tested against a square node + square image, where cover and
   contain are numerically identical — which hid the mistake.
2. The user then supplied a real screenshot of Figma's own crop UI on a portrait photo and pushed back
   ("Nie potwierdza... szerokość jest git ale wysokość ma tu przewagę" — width's fine but height
   dominates) — cover's defining trait is that the non-locked axis *overflows*, and that's exactly what
   the screenshot showed, which is what the user was objecting to. After several rounds of the user
   restating it more bluntly each time ("Wysokość powinna być spasowana do frame... żeby nie wychodziło
   w żaden sposób poza frame", "Zdjęcia ma się wpasować w frame jak fit") the fix landed: 0% is
   **always** the Fit/**contain** size (`getImageFillContainRect` — the largest rect matching the
   image's own aspect ratio that fits fully inside the frame, gaps allowed on the unlocked axis),
   regardless of the paint's own `scaleMode`. An intermediate attempt tried branching on
   `paint.scaleMode === 'fit'` (respecting the existing Fill/Fit choice) — plausible in isolation, and
   it matched `getImageCropRect.ts`'s own existing seed branch, but the user rejected it directly
   ("dalej nie działa") because the common case (`scaleMode: 'fill'`, the default) still overflowed.
   The rule is unconditional: **this toolbar always reasons in Fit terms**, independent of whatever
   Fill/Fit was picked for the paint's static (non-crop) rendering.
3. Once 0%/100% were right, the user caught one more thing live: zooming was re-centering the image
   back onto the frame's own center even when the user had manually dragged the image off-center first
   ("nie zmieniaj pozycji obrazka na center... ma zostać w swoim miejscu gdzie był" — don't move it to
   center, it should stay where it was). The anchor was changed from the frame's geometric center to
   the **crop's own current center** (`getImageCropRect(node, paint)`'s existing `x/y/width/height`,
   read fresh on every call) — since the newly-computed rect is always built to share that exact
   center, repeated slider drags keep resolving to the same anchor, so a zoom session never drifts.
   For a fresh/never-touched crop this still visually lands on the frame's center, only because the
   *seed itself* starts there (see below) — not because of anything the toolbar forces.

Deliberately does **not** reuse `selectSelectedImageCrop` — that selector is gated on
`imageEditor?.selectedTarget === 'image'` (only true once the user has clicked *into* the image inside
crop mode, per the `ImageCrop/` routing above) and has 13 established consumers across Position/
Dimensions/Rotation/canvas rotate-flip that all depend on that gate staying exactly as-is. The
toolbar's own visibility only ever depended on `imageEditor?.mode === 'crop'`, so a new selector,
`ImageCropToolbar/utils/selectImageCropTarget.ts`, mirrors `selectSelectedImageCrop`'s shape
(`createSelector([selectImageEditor, selectNodes], ...)`, same `isAppearanceNode`/`paint.type ===
'image'` guards) but gates on `mode === 'crop'` alone — resolving as soon as crop mode starts, before
`selectedTarget` ever flips to `'image'`.

Pure math lives in three new files under `ImageCropToolbar/utils/`: `getEffectiveImageSize.ts` (moved
out of `getImageCropRect.ts`, where it was a private function — now shared by both, reads the loaded
texture's actual pixel dimensions from `imagePaintTextureSizeCache`, swapping width/height for a 90°/
270° rotated image), `getImageCropZoomPercent.ts` (crop width → 0–100 against the Fit/contain-to-native
range, clamped both ends), and `computeImageCropZoomRect.ts` (percent → a full `TImageCrop`,
interpolating linearly between the contain rect and the native size per axis, then centering the
result on the *current* crop's own center rather than the frame's). `commitImageCropZoom.ts` dispatches
the result onto the targeted paint index only (modeled directly on the existing
`commitImageCropDimensions.ts`), and `useHandleZoomChange.ts` is the click-handler hook wrapping it
per the handlers-live-in-hooks convention. `useImageCropToolbar.ts` composes all of it: `isVisible`
still reads `selectImageEditor` directly (kept independent of the new selector so the toolbar still
shows even before a node/paint resolves — matters for existing tests that set `imageEditor` without a
real node in the store), while `zoom`/`onZoomChange` come from `selectImageCropTarget` +
`getImageCropZoomPercent`/`useHandleZoomChange`, falling back to a plain `0` when no target resolves
yet (texture not loaded, or crop mode just barely activated) instead of the old shell's arbitrary
`ZOOM_SLIDER_DEFAULT = 50` (removed — no longer meaningful once the value is always real).

**A fourth correction, after all of the above: entering crop mode must never itself change how the
image looks.** An intermediate pass also forced `seedImageCropIfNeeded.ts` (called from every
crop-mode-entry path — the toolbar's Crop button, the dropdown's "Crop" option, and the
resize-triggered auto-switch in `armResizeOnPointerDown.ts`) to always seed the Fit/contain rect,
reasoning that "never overflow" should apply from the very first frame. The user caught this live and
reversed it directly: "To musi się dostosować do zdjęcia, nie może być takiej zmiany" (it must adapt to
the image, there can't be a change like that) / "slider ma mieć odpowiednią pozycję... ale nie może
ingerować w rozmiar zdjęcia gdy włączamy tą opcję" (the slider should show the right value, but it must
not touch the image's size when this mode turns on). Reverted `seedImageCropIfNeeded.ts` back to its
original behavior — delegating to `getImageCropRect.ts`'s own `seedFromNaturalSize`, which still
branches on `paint.scaleMode` (`'fit'` → contain, `'fill'`/default → cover) exactly as it did before
this whole feature, so opening crop mode is a pure no-op on how the image currently renders. The "always
Fit/contain" rule from point 2 above applies **only** to the slider's own zoom math
(`computeImageCropZoomRect`/`getImageCropZoomPercent`), which already correctly reports whatever percent
the *current* (possibly still-overflowing) crop happens to sit at — including values other than exactly
0% right after entering crop mode — and only actually resizes anything once the user touches it.

Covered by three e2e tests in `fill-section.spec.ts`: one for the basic 0→100%→0 sweep on a
matching-aspect (square node, square image) pair; one confirming entering crop mode with a default
Fill-mode paint leaves the (overflowing) crop exactly as it already was, and only *dragging the slider
to 0%* produces the non-overflowing Fit/contain size; and one proving the anchor stays wherever the
user last dragged the image via a canvas pointer-drag inside the shape
(`designPage.pointerDown`/`pointerMove`/`pointerUp`) before ever touching the slider, rather than
snapping back to the frame's own center. All three were confirmed to genuinely fail against each of
their corresponding pre-fix implementations via git-stash/backup-file round-trips.

**`ImageCropAspectRatioMenu` (same toolbar, the dropdown next to the zoom slider) resizes the NODE to
fit a target aspect ratio around its current crop, rather than touching the crop/image at all** — the
opposite direction from the zoom slider (which resizes the image around a fixed frame). Like the zoom
slider, this was a pure UI shell (every `MenuItem` had `withCheck={false}`, no `onClick`, one item even
had a hardcoded `selected` placeholder) until the user specified the mechanics directly: **"Original"**
resizes the node to the paint's real native pixel dimensions; every other preset (**Square/Circle
(1:1)**, **Landscape 16:9/4:3/3:2**, **Portrait 9:16/3:4/2:3**) resizes the node to the largest rect of
that ratio that fits **inside the current crop rect** (never bigger — "dostosowanie node do zdjęcia",
fitting the node *to* the image, not the other way around); and in both cases **the node ends up
centered on the crop's own current center**, exactly mirroring the zoom slider's own anchor rule. The
image/crop itself is never touched by any of this — a plain `updateNode` on the node's own `x/y/width/
height` doesn't automatically drag `paint.crop` along (nothing else links them), so "resize the frame
without moving the image" falls out for free, no special decoupling logic needed.

New files under `ImageCropAspectRatioMenu/`: `types.ts` (`TAspectRatioTarget = 'original' | {
cornerRadius?: 'max'; ratioWidth, ratioHeight }`), `constants.ts` (one named constant per preset —
`ASPECT_RATIO_SQUARE`, `ASPECT_RATIO_CIRCLE`, `ASPECT_RATIO_LANDSCAPE_16_9`, etc. — plus
`ASPECT_RATIO_PRESETS`, the full list, used for the Custom checkmark below), `utils/
getAspectRatioPresetRect.ts` (the shared geometry: `'original'` uses `getEffectiveImageSize` centered on
the current crop's center; any ratio target reuses `getImageFillContainRect(currentCropRect, ratioWidth,
ratioHeight)` — the exact same util the crop's own Fit-mode math uses, just with the *crop rect* as the
containing bounds instead of the *node*), `utils/commitAspectRatioPreset.ts` (dispatches the computed
rect onto the node), and `utils/isAspectRatioPresetActive.ts` (the checkmark logic — **no menu state is
stored anywhere**; each item independently recomputes its own target rect from the live node+paint and
compares it against the node's actual current `x/y/width/height` within a small epsilon, exactly
matching the user's own description: "sprawdzenie wartości aktualnego frame względem zdjęcia" (checking
the current frame's values against the image)).

**Circle needed one more thing beyond Square: an actual corner radius, and the user caught a real
follow-on bug live.** "Circle (1:1)" and "Square (1:1)" share the identical 1:1 rect math, so the only
way to tell them apart is `cornerRadius` — `ASPECT_RATIO_CIRCLE` carries `cornerRadius: 'max'`,
`commitAspectRatioPreset.ts` resolves that to `getMaxCornerRadius(rect)` (`Math.min(width, height) / 2`,
already used elsewhere for corner-radius drag clamping — reused here, not reinvented) and dispatches it
alongside the resize. The bug: the first pass only set `cornerRadius` when the target explicitly asked
for it, leaving it **untouched** for every other preset — so picking Circle then Square left the node
still rounded ("Kurwaaa square ma radius usuwać" — Square must clear the radius). Fixed by always
including `cornerRadius` in the dispatched changes: `getMaxCornerRadius(rect)` for Circle, a flat `0`
for every other preset — cornerRadius is never left ambiguous/inherited, matching this whole feature's
"always derive fresh, never carry over stale state" philosophy. `isAspectRatioPresetActive`'s own check
only additionally verifies `cornerRadius` for the Circle target itself (Square's own check still ignores
it) — so Square and Circle can still both show checked simultaneously if the shape happens to be 1:1
with radius 0, an accepted, unforced consequence of every item checking itself independently rather than
a single centrally-resolved "current preset".

**"Custom" shows checked exactly when no fixed preset matches** — the user's own second follow-up
("Jeśli jest custom to niech będzie check zaznaczony... Custom jest check wtedy kiedy żadna z opcji nie
pasuje"). `useImageCropAspectRatioMenu.ts` derives `isCustomActive` as `!ASPECT_RATIO_PRESETS.some(isPresetActive)` — reusing the exact same list `constants.ts` exports, so a new preset added there is
automatically covered by both the menu and this check with no separate registration step. Custom's own
`MenuItem` needs no `withCheck` override at all: the shared `Menu` component's own default is `true`
(shows the check slot, `selected` toggles its opacity), matching every other preset item — only `MenuSub`
(the Landscape/Portrait *trigger* rows, which can never be individually checked) defaults to `false`.

`hooks/useHandleSelectAspectRatioPreset.ts` (the click handler) and
`hooks/useImageCropAspectRatioMenu.ts` (composes it with `isPresetActive`/`isCustomActive`, all sourced
from the same `selectImageCropTarget` selector the zoom slider already uses) follow the same shape as
`useHandleZoomChange.ts`/`useImageCropToolbar.ts`.

Covered by three e2e tests in `fill-section.spec.ts`: picking "Square (1:1)" on a wide 200×100 node with
a square source image, switched to Fit mode first (so — per the seed-revert above — the crop is seeded
to the non-overflowing 100×100 contain rect rather than an overflowing cover rect), confirms the node
shrinks to 100×100 while staying centered on the *original* node's own center; picking "Circle (1:1)"
under the same setup confirms the node also picks up a corner radius of exactly 50 (half its own size),
and that picking "Square" straight afterward squares the corners off again (the exact regression the
user caught live); picking "Original" with a distinctively-sized (300×150) source image confirms the
node resizes to that exact pixel size. All confirmed to genuinely fail against their respective
pre-fix states via a backup-file round-trip.

**`getCropTargetPaintIndex.ts` (the Image edit toolbar's Crop button) needed a second signal besides
`selectedFillIndices`.** An earlier fix in this cluster made the Crop button target whichever fill row
is `selectedFillIndices`-selected, rather than always fill 0 — but a fill row's picker being *open* is
tracked by an entirely separate piece of state (`imageFillPickerFocus`, see the `useSyncImageEditor`
narrative above), decoupled from row selection. The user's live repro: open fill row 1's picker (Image
tab), but the "selected" row state still pointed elsewhere — clicking Crop targeted fill 0 anyway. Fixed
by adding an `openPickerIndex` third parameter to `getCropTargetPaintIndex`, sourced from
`selectImageFillPickerFocus` (guarded to the currently selected node's own id) in `useHandleCropClick.ts`.
Priority order, per explicit user correction ("switch" — the first pass checked
`selectedFillIndices` before the open picker, the user asked for the reverse): the **open picker wins
first**, then `selectedFillIndices`, then the fallback to the first image fill from the top — reasoning
that an actively open picker is a stronger, more current signal of what the user is looking at than a
possibly-stale row selection.

Covered by a new e2e test in `fill-section.spec.ts`: switching a second fill to Image leaves its picker
open (without ever clicking that row's own strip to "select" it), then confirms clicking Crop targets
that open-picker row (index 1), not the fallback (index 0) — confirmed to genuinely fail against the
pre-fix version via a backup-file round-trip.

**The `ImageCropToolbar`'s "Fit" button (`FitLayout` icon, next to the aspect ratio menu) resizes the
NODE to exactly match wherever the image currently is** — no ratio math at all, unlike every option in
`ImageCropAspectRatioMenu`. The user's own framing: "Przycisk fit dostosowuje node do zdjęcia" (the Fit
button adjusts the node to the image) / "Do tego co jest aktualnie" (to whatever is currently there).
Implemented as `commitFitNodeToImage.ts`, the simplest of all the crop-toolbar commits: read the
current crop rect via `getImageCropRect(node, paint)` (the same function every other crop-geometry util
in this cluster reads from) and dispatch its `x/y/width/height` straight onto the node, unchanged — no
interpolation, no target ratio, no centering math, since the crop rect is already exactly what should
become the node's new bounds. `useHandleFitClick.ts` wires it to the button, sourcing `node`/`paint`
from the same `selectImageCropTarget` selector every other crop-toolbar hook already uses.

Covered by a new e2e test in `fill-section.spec.ts`: drags the image (not the frame) by `(20, 20)` while
in crop mode, then clicks Fit and confirms the node moves to exactly match the dragged crop rect's own
`x/y/width/height` — proving it tracks whatever the crop currently is, not a fixed preset — confirmed to
genuinely fail (node stays at its pre-drag position) against the pre-wiring shell via a backup-file
round-trip.

**The `ImageCropToolbar`'s Confirm (check icon) button exits crop mode entirely** — the last dead
control in this toolbar's original UI shell. Per the user's own framing ("Przycisk check zamyka crop
ten ostatni tzn. wychodzi z edycji" — the check button closes crop, this last one, i.e. exits editing),
it does nothing to the crop geometry itself; it just clears the editor. `useHandleConfirmClick.ts`
dispatches `setImageEditor(null)`, the same call `useHandleExitImageEditor.ts` (FillSection) and every
`armExitImageEditorOnPointerDown`-style resolver already use elsewhere to leave the Image editor. The
Cancel button next to it is a separate, still-unwired control — out of scope for this change.

Covered by a new e2e test in `fill-section.spec.ts`: enters crop mode, clicks Confirm, and asserts
`imageEditor` becomes `null` and the crop toolbar is replaced by the Image edit toolbar's own Crop
button again — confirmed to genuinely fail (editor stays in crop mode) against the pre-wiring shell via
a backup-file round-trip.

**The `ImageCropToolbar`'s Cancel button discards every change made during the crop session**,
restoring the node to exactly how it looked the moment Crop was first clicked — Figma's own behavior,
per the user's framing ("Figma robi tak że cofa poprzedni ruch wykonany cropa"). The obvious first idea
— reuse the app's undo/redo stack (`store/history/`) directly — was explicitly rejected: popping
`historyStack.undo()` N times would also unwind any unrelated action that happened to land on the stack
in between, and there's no clean way to know how many steps to pop. What IS reused is the *shape* of
undo/redo's own mechanism (`getDesignSnapshot`/`replaceDesignSnapshot`'s "snapshot now, restore later"
pattern) — but scoped down to just the one node being cropped, not the whole `pages` tree, since every
crop-session mutation (`commitImageCropZoom`, `commitAspectRatioPreset`, `commitFitNodeToImage`, and
every canvas-drag resolver under `armImageCropOnPointerDown/`) only ever touches that single node's
`fills`/`x`/`y`/`width`/`height`/`cornerRadius` via `updateNode`.

The harder problem the user pushed on before agreeing to this approach: crop mode can be *entered* from
five-plus different call sites (`useHandleCropClick`, `useSetImagePaintScaleMode`, `disarmResizeDrag`,
`useSyncImageEditor`, the fill-mode dropdown's Crop option), and the *target* (`nodeId`+`paintIndex`)
can also change mid-session (e.g. opening a different fill row's picker while still in crop mode) — so
capturing the "before" snapshot at any one of those call sites individually would be exactly the kind of
scattered, easy-to-miss-a-case logic the user flagged as unscalable ("nieskalowalny kod"). The fix:
capture it centrally, inside the `setImageEditor` **reducer** itself
(`store/design/utils/handleSetImageEditor.ts`), not at any dispatch site. The reducer sees both the
previous and next `imageEditor` value on every call, so it can decide in one place whether this
transition is "entering crop for a new target" (previous mode wasn't `'crop'`, or the `nodeId`/
`paintIndex` changed) — and if so, read the target node's current appearance straight off `state.pages`
and stash it as `imageEditor.cropCancelSnapshot`. Every other transition (same target re-dispatched with
a different `selectedTarget`, leaving crop entirely, or leaving the editor altogether) either carries the
existing snapshot forward untouched or drops it — none of the five-plus call sites needed to change at
all, or even know this field exists. `useHandleCancelClick.ts` is the only consumer: if
`cropCancelSnapshot` is present, dispatch `updateNode({ changes: cropCancelSnapshot, id: nodeId })`
before `setImageEditor(null)`; if absent (mode never actually reached `'crop'`, or the node vanished),
just exit.

Covered by a new unit test file (`handleSetImageEditor.spec.ts`, 6 cases: null payload, entering a
non-crop mode, entering crop fresh, re-dispatching the same crop target, switching crop target mid-
session, and a missing node) plus a new e2e test in `fill-section.spec.ts`: enters crop mode, picks
Circle from the aspect ratio menu (a real width/height/cornerRadius change), clicks Cancel, and asserts
the node is back to its exact pre-crop `x/y/width/height/cornerRadius` — confirmed to genuinely fail
two different ways via backup-file round-trips: once with the Cancel button unwired (nothing happens,
editor stays open), and once with the reducer's snapshot-capture reverted to a plain assignment (Cancel
exits the editor but the node keeps its post-Circle geometry, since there's nothing to restore from).

## Adding a panel for another node type

1. Route it in `PanelProperties.tsx`.
2. Compose it from `Common/` sections; move any section that a second panel now needs from the
   node folder into `Common/` (keep the i18n keys under `…panelProperties.common.*`) and widen its
   hooks' node-type gate to `isBoxSceneNode`.
3. Add `…panelProperties.<node>.*` i18n, a `<Node>.spec.tsx`, and an e2e in
   `e2e/design/panels/` if the panel drives canvas geometry (dimension/position edits do).
