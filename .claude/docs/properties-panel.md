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
