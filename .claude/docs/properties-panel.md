# RightPanel properties panel (`components/Design/RightPanel/PanelProperties`)

`PanelProperties.tsx` is a `switch (true)` router keyed on the active tool and the current
selection:

| condition | panel |
| --- | --- |
| frame tool active | `FrameTool/` |
| nothing selected | `NoSelection/` (Page background, Styles, Export, MCP) |
| one or more `NodeType.frame` (every selected node a frame) | `Frame/` — multi-select reuses the single-frame sections, which read the first selected node |
| single `NodeType.rectangle` | `Rectangle/` |
| anything else | `null` |

## `Common/` — shared between node panels

Sections that more than one node panel needs live in `PanelProperties/Common/`, not under any one
node's folder. Today:

- `Common/PanelHeader/` — `PanelHeader` wraps `UITools.ComponentHeader`. Given a `menu` prop it
  renders the label inside a `UITools.ButtonMenu` trigger (chevron + dropdown); without one it
  renders a plain label span. `PanelHeaderComponentButton` is the shared "Create component" button
  (`common.panelHeader.*` i18n). `PanelHeaderMatchingLayersButton` ("Select matching layers",
  `MatchingLayers` icon, `⌥⌘A`) renders only while `selectCanSelectMatchingLayers` is true (every
  selected node nested below a top-level frame, or below a frame sitting directly in a section).
  Click and the `selectMatchingLayers` keyboard shortcut both go through
  `useKeyboardShortcuts/utils/handleSelectMatchingLayers`, which extends the selection with
  `store/design/utils/matchingLayers/getMatchingLayerIds` — Figma's rules: same layer name, same
  ancestor names and depth below the top frame, same-named siblings matched by occurrence index,
  candidates limited to the other non-section containers sharing the top frame's parent (root or
  the same section). When nothing new gets added (no matches, or the selection isn't eligible) it
  keeps the selection and shows `DesignHint`'s snackbar with `design.toolbar.matchingLayersHint.none`
  ("No matching layers to select on page"). Text layers are matched by name only (Figma's text-style fallback isn't
  implemented). Note new layers get numbered names (`Rectangle (1)`), so freshly drawn shapes only
  match once renamed.
  `PanelHeaderWrapInSectionButton` (`SectionTool` icon, "Wrap in new section" + `⌘S` tooltip) renders
  only while more than one node is selected. **Visual only so far** — no click handler; the
  `wrapInNewSection` action itself isn't implemented yet (ObjectMenu's item is still disabled).
- `Common/PositionSection/` — Alignment, Position, Rotation, plus the ignore-auto-layout toggle.
  Its hooks (`useColumnPosition`, `useColumnAlignment`, `useColumnRotation`,
  `buildRotationButtons`) gate on `isBoxSceneNode(selectedNode)` rather than
  `type === NodeType.frame`, so they work for any box scene node. `rotateNodesRigidly` takes a
  `TBoxSceneNode` for the same reason.
- `Common/PositionSection/ColumnAlignment` with **2+ selected nodes**: the selection is split into
  per-parent groups (`getSelectionGroups`, same split as the multi-parent outline/drag) after dropping
  auto-layout/grid-managed nodes (`isNudgeableNode`); each group with 2+ members aligns against its
  own rotated bounding box (`getSelectionBounds`) — left/right/top/bottom edge-to-edge, center to the
  box's center line (`getAlignmentOffset`). Nodes move with their whole subtree through
  `Canvas/utils/translateNodes` (shared with arrow-key nudge), no constraints are written, one undo
  step (`alignSelectionGroups`). The buttons are disabled when no group has two movable members. A
  selected frame never switches to child alignment in a multi-selection, and the More actions menu
  is hidden for now.
- `Common/PositionSection/ColumnAlignment` — for a **top-level free-form frame with children**
  (`hooks/utils/canAlignFrameChildren`: frame, no `parentId`, `layoutMode` free-form/unset, at
  least one child) the buttons are enabled and align the frame's **children**, each one on its own
  against the frame's edges (`alignFrameChildren` → `moveNodeToAlignment` per child, which also
  writes that child's `alignment` constraint, other axis kept), in one undo step. A nested frame
  still aligns itself inside its parent, even with children. `DistributeMenu` (trigger icon
  `DistributeVerticalSpacing`; items Tidy up ⌃⌥T / Distribute vertical spacing ⌃⌥V / Distribute
  horizontal spacing ⌃⌥H) shows in the row's `buttonsIcon` for any free-form frame with children
  (`isFreeFormFrameWithChildren`, nested or not) and for any multi-selection. `useDistributeMenu`
  works on "arrange groups": the non-auto-layout children of a single selected top-level free-form
  frame, or the per-parent groups of a multi-selection (`getAlignableSelectionGroups`). Every
  action uses rotated bounds and moves layers with their whole subtree (`translateNodeSubtree` →
  `Canvas/utils/translateNodes`), one undo step per click.
  - Distribute vertical/horizontal spacing (`distributeNodes`): groups with 3+ layers; sorts by start
    on the axis, keeps the outermost span, equal gaps.
  - Tidy up (`hooks/utils/tidyUp/`): multi-selection only (disabled for a single frame's children,
    like Figma), groups of 2–99 layers, and only while tidying would actually move something
    (`isTidyableGroup`), so it disables itself right after a click. All math runs on pixel-rounded
    rotated bounds (`getTidyUpRect`: position and size rounded separately) because the move itself
    rounds `x`/`y`, otherwise every click drifted the layers apart. `getTidyUpKind`: all bounds
    overlap one horizontal line → `row`, one vertical line → `column`, both → none (piled up), else
    `grid`. Row/column (`getLineTidyTargets`): first layer stays, the rest follow at the most common
    gap (`getModeGap`, ties → smaller, clamped ≥ 0), cross axis untouched. Grid
    (`getGridTidyTargets`): rows from vertical overlap (`getGridRows`), reading order; column count =
    the detected row length when rows are regular, else ceil(√n) (`getGridColumnCount`); column
    width / row height = largest member; one shared gap (mode of all horizontal and vertical gaps);
    laid out from the group's top-left, each layer at its cell's top-left. **Open question:** a wide
    layer with a separately spaced row below it ("one big frame and two smaller ones with their own
    gap") isn't a grid for the user — the right behaviour for that layout is not decided yet. The menu item's icon follows the detected kind
    (`TIDY_UP_ICONS`: `TidyUpHorizontal` / `TidyUpVertical` / `TidyUpGrid`), the label stays "Tidy up".
    While Tidy up is available the menu's trigger shows that same icon instead of
    `DISTRIBUTE_MENU_TRIGGER_ICON`; the click still opens the menu.
  The ⌃⌥T/V/H shortcuts are only shown in the menu, not wired up.
  Single-frame child alignment also goes through subtree translation now (so group children move
  with their members) and still writes each box child's constraint.
- `Common/PositionSection` with **2+ selected layers**: X / Y (`useColumnPosition`, per-layer
  `getPositionEntry`) and Rotation (`useColumnRotation`) show `positionSection.mixed` ("Mixed") when
  the values differ (`getMixedOrValue`); the fields take a `displayValue` (the X/Y input switches to
  `type="text"` for it) next to the numeric scrub `value`. A typed value is set on every layer (X/Y
  skip layers whose axis is locked by auto layout or a constraint; the fields disable only when every
  layer is locked), one undo step. Scrubbing moves/turns every layer by the same delta from where it
  was at drag start (snapshotted in a ref on `onDragStart`, so the field stays Mixed). The rotate-90
  button turns each layer on its own; the flip buttons (`buildRotationButtons` now takes the layer
  list, disabled only when every layer is a section) run `handleFlipSelection`, which flips every
  frame in the selection as a single frame (`flipFrameTree`) mirrored around the selection's centre,
  so the layers swap places.
- `Common/ColumnDimensions` with **2+ selected layers**: W / H show `columnDimensions.mixed` when they
  differ (fields take `displayValue`, switch to `type="text"`). A typed value goes through
  `commitNodeDimension` per layer (its own `lockedAspectRatio` and min/max clamp, like Figma — the
  bounds are clamped to, not removed), one undo step; scrubbing resizes each by the same delta from a
  drag-start snapshot (`TDimensionsScrubStart`, `types.ts`). After a multi commit the input text is rewritten from
  the store (`useDimensionsCommit` / `usePositionCommit`'s third argument), because the fields are
  uncontrolled and a Mixed → Mixed result would otherwise leave the typed number showing. The W/H
  menu's min/max state (`useToggleColumnMinMax(nodes, mixedLabel)`, helpers in `hooks/utils/`:
  `getBoundDisplayValue`, `hasBoundOnSome`, `hasBoundOnEvery`) shows "Min width: Mixed" etc. for
  differing or partly set bounds; the field's min/max icon replaces the W/H letter only when every
  selected frame has that bound; a bound counts as present for reveal/remove when any frame has it, and
  "remove bounds" clears it on every frame. `Frame/LayoutSection/ColumnMinMaxDimensions` shows the
  shared bound or `columnMinMaxDimensions.mixed` (differing or partly unset). A bound only some frames
  have is disabled (like Figma); differing values stay editable and a typed W/H is clamped per frame,
  so min 15 / min 300 with W = 200 stays Mixed (200 and 300); otherwise a typed or scrubbed bound goes to every frame via `getMinMaxBoundChanges` (keeps min ≤ max, clamps the size). The
  lock button and Fixed/Hug/Fill still act on the first layer only.
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
  falls outside a shrunken `fillCount`) and `useItemsReorderDrag` mirrors `useGridTrackReorderDrag`
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
  `useGradientRotateRefs` folder holding `gradientRotateDragRef`, `resolveGradientRotateHover`
  (writes the hover ref and returns the cursor) wired into `HOVER_RESOLVERS`/`HANDLE_HOVER_RESOLVERS`, and
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

Images and videos placed with the Media tool (toolbar Image/video… or File → Place image) are plain
rectangles with one `image`/`video` fill (`useDrawMediaTool/utils/buildMediaRectangleNode`, named
"Image"/"Video"), so they use this panel. `RectangleHeader/utils/getRectangleHeaderLabelKey` switches
the header label to Image/Video when every selected rectangle is filled only with images/videos
("N selected" when images and videos are selected together)
(`utils/design/paint/getNodeMediaFillType`), and the Layers row shows the `Image`/`Video` icon instead
of the shape outline. Legacy `NodeType.media` nodes in old files still render, but are no longer
created and have no panel.

## `Line/`

`Line.tsx` = `LineHeader` (component, mask, boolean buttons + the shared shape "…" menu
`Common/PanelHeader/PanelHeaderShapeMoreActionsButton`: Edit object, a separator and Offset vector — enabled
for one selected layer that `isOffsetVectorNode` accepts (`useStartOffsetVector`), it sets `design.offsetVector`,
which shows `Toolbar/OffsetVectorToolbar` above the bottom toolbar and a magenta preview on the canvas
(`drawOffsetVectorPreview`); ✓ / Enter replaces the line with `getLineOffsetVector`, Cancel / Esc clears it —
no component items) — titled "Arrow" for a single line with an arrowhead (`isArrowLine`) and "N selected" for any
multiple selection of lines or arrows (`getLineHeaderLabel`), which also swaps the shape "…" menu for the shared
`PanelHeaderMoreActionsButton` (component items, Edit objects, Wrap in new section) → `PositionSection` → Layout (`ColumnDimensions isHeightDisabled`, since a
line's height is always 0) → `AppearanceSection withCornerRadius={false}` → `FillSection
property="strokes"` with `LineStrokeSettings` as its footer → `EffectsSection` → `Export`. No Fill.
`LineStrokeSettings` shows the Position dropdown, the Weight field and the
Start point / End point dropdowns (`getLineEndpointOptions`; the End point icons are rotated 180°).
Position is editable (Inside = left of the line's start→end direction, Outside = right; locked to Center
outside the Basic mode) and the Properties button opens the shared stroke settings panel — its tab hooks
select `isStyledNode`, and the Basic tab hides Join and Miter angle (`hasJoin`) when only lines are
selected. The Start point / End point row is hidden while every selected line is in Brush mode.
The shared hooks (opacity, blend mode, effects, stroke paints) accept lines through `isStyledNode`
(`TAppearanceNode | TLineNode`); `useFillSection` uses `isPaintPropertyNode`, so lines take part in
strokes but never in fills. Hooks for fields a line lacks (corner radius, stroke sides, advanced
stroke settings) keep gating on `isAppearanceNode`.
Lines are also a `PANEL_SECTIONS` type for the Mixed panel (position, rotation, layout, appearance,
stroke, effects, export — no fill or corner radius), and `useStrokeSettingsRow` reads and writes the
Weight across every `isStyledNode` (so a line with a rectangle shares it), while Position and the
per-side strokes stay on the `isAppearanceNode` shapes only.

## `Ellipse/`

`Ellipse.tsx` (shown while every selected layer is an ellipse) = `EllipseHeader` (same buttons as
`RectangleHeader`) → `PositionSection` → Layout (`ColumnDimensions`, `ColumnSpacing`,
`ColumnGridChildSpan`) → `AppearanceSection shapeCornerRadiusType={NodeType.ellipse} withArc withCornerRadius={false}` (one Corner
radius field next to Opacity through `ShapeCornerRadiusInput` / `useShapeCornerRadius`, no individual corners,
disabled while no selected ellipse is cut (`hasShapeCorners`); the row gets a bottom margin above Arc) →
`FillSection` → `FillSection property="strokes"` with `Common/ShapeStrokeSettings` as its footer (Position,
defaulting to Inside, Weight and the shared stroke settings panel, like the line footer; Join stays hidden
because `hasJoin` only counts rectangles) → `EffectsSection` → `Export`.
An ellipse stores paints like a rectangle (`fills`, `strokes`, `effects` and the stroke mode fields), so
`isStyledNode` includes it (opacity, blend mode, effects, stroke paints) and `isPaintPropertyNode` gives it
fills (lines never). It is also a Mixed panel type (position, rotation, layout, appearance, fill, stroke,
effects, export).
`Common/AppearanceSection/Arc/ArcRow` is one `UITools.FieldGroup` of Start (°, with the `Arc` icon as
the scrub handle), Sweep (%) and Ratio (%), read with the same helpers as the canvas arc labels
(`getEllipseArcValues` → `getEllipseArcStartAngleDegrees` / `getEllipseArcSweepPercent`). Typing Start
turns both arc angles by the difference (like the rotate handle), Sweep sets `arcEndAngle` through
`getEllipseArcSweepSpan` (100% closes the ellipse), Ratio sets `arcRatio`; several ellipses show Mixed
and commit in one undo step. Sweep and Ratio scrub from their left edge (`UITools.ScrubbableEdge`).
An ellipse `cornerRadius` rounds only the sharp corners of a cut arc (`hasEllipseCorners`): the centre
and both arc ends of a pie, or the four ends of a ring segment. `getEllipseFillPoints` rounds them with
`roundPolygonCorners` (each corner's cut limited to half of each neighbouring edge, joined by a circular
fillet), and that one shape is drawn (stencil fill), outlined on hover, hit-tested, exported and turned
into a vector.

## `Polygon/`

`Polygon.tsx` (shown while every selected layer is a polygon) = `Common/ShapeHeader` (the Ellipse header buttons
with the shared shape "…" menu `PanelHeaderShapeMoreActionsButton` instead of Edit object; label and e2e value
come as props) → `PositionSection`
→ Layout (`ColumnDimensions`, `ColumnSpacing`, `ColumnGridChildSpan`) → `AppearanceSection
countType={NodeType.polygon} shapeCornerRadiusType={NodeType.polygon} withCornerRadius={false}` (Opacity and one Corner radius
field, always enabled for polygons, then `Common/AppearanceSection/Count/CountRow`: the `sides` count with the
`Count` icon as its scrub handle, 3–60, rounded, Mixed for different counts, scrubbed by the same amount on
each polygon through `useShapeCount(type)`) → `FillSection` → `FillSection property="strokes"` with
`ShapeStrokeSettings type={NodeType.polygon}` → `EffectsSection` → `Export`. A polygon stores paints like an
ellipse, so the shared hooks accept it through `isStyledNode`, and it is a Mixed panel type with the same
sections. `Common/types.ts` holds `TShapeNode` / `TShapeNodeType` (ellipse, polygon or star) used by the shape
corner radius and stroke settings.
Offset vector works for polygons and stars too (`isOffsetVectorNode` = line, polygon or star): `utils/canvas/offsetVector/getOffsetVector`
picks `getLineOffsetVector` or `getPolygonOffsetVector` (cached per node, distance and join; a star goes the polygon
way with its sharp star points and star max corner radius) — the polygon's sharp
world corners pushed out by the distance (`getOffsetPolygon`, mitred, clean for concave shapes) and rounded by the distance for Round, or by
corner radius + distance when the polygon is rounded; the vector keeps the polygon fills
(`getClosedLoopPaintFillData`) and its stroke with Position. The preview draws that filled vector
(`drawVectorNode`) under the magenta outline; ✓ / Enter replaces the polygon with it in one undo step. The toolbar
distance and corner handlers live in `OffsetVectorToolbar/utils` (`changeOffsetVectorDistance`, `changeOffsetVectorJoin`).
While offsetting, `drawScene` treats the selection as empty (no selection box, resize / rotate handles, size label or
shape handles) and draws the layer's hover-style outline instead. `resolveOffsetVectorHover` (first hover resolver)
finds the pink outline under the pointer (`getOffsetVectorEdgeAtPoint`: nearest flattened segment within
`OFFSET_VECTOR_EDGE_HIT_PX`, outward normal = the side farther from the source outline), keeps it in
`refs.offsetVector.hoveredOffsetVectorEdgeRef` and turns the resize cursor across it; every other hover is blank.
`armOffsetVectorOnPointerDown` (first arm resolver) grabs that edge into `offsetVectorDragRef` and swallows any other
press; `continueOffsetVectorDrag` sets the distance to the start distance plus the pointer's move along the normal
(rounded, at least 0). `drawOffsetVectorDistanceLabel` shows the distance in a pink badge at the hovered edge point, or
at the pointer while dragging.

## `Star/`

`Star.tsx` (shown while every selected layer is a star) is the Polygon panel with `NodeType.star`: the same
`ShapeHeader`, Position, Layout, `AppearanceSection countType={NodeType.star}` (Opacity, Corner radius, then a
`CountRow` whose Count sets `points` with the `CountStar` icon and whose second field is
`Common/AppearanceSection/Ratio/RatioField`: the inner ratio as a percentage with one decimal, 0.1–100%, Mixed
for different ratios, scrubbed by the same amount through `useStarRatio`; stored as `ratio` 0.001–1), Fill,
Stroke with `ShapeStrokeSettings type={NodeType.star}`, Effects and Export. `CountRow` takes the shape type;
`getShapeCount` / `commitShapeCount` read and write `sides` or `points`.

## `Vector/`

`Vector.tsx` (shown while every selected layer is a vector) is being built in stages (A: header, position,
layout, export; then fill, appearance, stroke, effects, corner radius). A vector has no stored box: its X/Y/W/H
are its vertex bounds (`getNodeBounds` → `getVectorNodeBounds`).

- `VectorHeader`: "Vector path" with matching layers, create component (single selection), mask and boolean;
  the "…" menu comes later.
- `Common/PositionSection` is shared: `Common/utils/isExistingTransformPanelNode` lets `useColumnPosition` and
  `useColumnRotation` take vectors next to box nodes. `getPositionEntry` reads the position from the bounds and
  never disables it for a vector (vectors do not take part in auto layout, so there is no ignore toggle either);
  `commitColumnPosition` moves a vector like a group, through `translateNodeSubtree`; `rotateNodesRigidly` uses
  the bounds centre as the pivot. A single vector keeps the alignment row disabled (no box to align to its parent).
- `VectorDimensions` replaces `ColumnDimensions` (no sizing modes or min/max): W/H rounded to two decimals,
  Mixed across vectors, and an aspect-ratio lock stored as `TVectorNode.lockedAspectRatio`.
  `resizeVectorToDimensions` scales through the canvas `resizeNode` around the top-left of the bounds, leaving an
  axis with no extent (a straight line) unscaled.

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

**A "Shader" tab was added to `PaintTypeRow` as an inert placeholder** — icon only, no backing paint
type, no panel body. The user's own framing: "dodaj sekcję shader do tego panelu z tą ikoną. Tylko
tyle. Shadery zostawiamy narazie to za ciężki temat" (add a Shader section to this panel with that
icon, just that — shaders are too heavy a topic for now). `ColorPickerTab.shader` was added to the
enum and wired through every switch that already branches on `ColorPickerTab`, but each one either
does nothing or renders nothing for it:
- `renderBody.tsx` gets an explicit `case ColorPickerTab.shader: return null;` — **not** left to fall
  into the `default:` case, since that case means "Solid" here, and an unhandled `'shader'` value would
  have silently shown the Solid panel's body instead of a blank one.
- `useSetActiveTab.ts`'s `isColorPickerTab` type guard gets `'shader'` added (it enumerates every valid
  tab explicitly, so a value it doesn't know is treated as "not a real tab" and the whole handler
  no-ops) — without this, clicking the Shader button wouldn't even visually mark it selected, since
  `setActiveTab` would never fire. Its own internal `switch (tabName)` then gets `case
  ColorPickerTab.shader: break;` — for the same elimination-pattern reason as `renderBody`, an
  unhandled `'shader'` would have fallen into `default:`, which fires `onChange(value)` as if committing
  a solid color, a real (if currently invisible, since the paint never actually changes to anything
  the tab could reflect) side effect that doing nothing shouldn't have.

The icon itself (`Shaders`, from `packages/components/src/Icon/svg/shaders.svg`) was registered in
`xigma-app-shared` (`Icon/constants.ts`, alphabetical import + `Icons` entry) and pulled in via
`npm run xigma:pull` — see [[xigma-icons]] for the general flow. A first attempt used a generic "Video"
icon glyph for the **video fill's own right-panel swatch** in a related but separate task that same
session and was corrected immediately once the user clarified they wanted the video's actual extracted-
frame picture there (via `thumbnailUrl`, same mechanism `imageUrl` already used), not an icon — worth
noting here only because it's the same class of mistake this Shader tab could invite in the future: a
placeholder icon is for a tab/section that has no real content yet, not a substitute for showing real
content a feature actually has available.

### Fill paint blend mode (trailing icon in the paint-type row)

A fill's own blend mode (Multiply, Screen, etc. — applied where the fill composites against
whatever is behind the shape) is set from a `BlendModeButton` living at the trailing end of the
picker's `PaintTypeRow` (`shared/UITools/ColorPicker/PaintTypeRow/BlendModeButton/`), not from a
new tab. Per the user: "Blend można użyć dla wszystkiego: solid gradient, image, video, to jest
akurat stan który zostaje nawet jeśli zmieni z solid na gradient" (blend mode applies to every paint
type and survives a paint-type switch), and "ta ikona pojawi się na końcu z prawej więc musisz
owrapować tą ikonę w wrapper i dać margin left auto. Wrapper przyda się bo dojdzie obok niej inna
ikona" (wrap it so it's pushed to the right, with room for another icon to land next to it later).

- **Placement**: `PaintTypeRow.tsx` renders the six paint-type `ButtonIcon`s as before, then a
  trailing `<div className={styles['PaintTypeRow__extra']}>` (`margin-left: auto`, its own `gap`)
  wrapping just `BlendModeButton` — an empty wrapper reserved for a future second icon, not a
  one-off style on the button itself.
- **Component shape mirrors the vector tool's own paint blend button almost exactly**
  (`Toolbar/VectorEditToolbar/VectorEditPaintTool/FaceBlendModeButton/`) — `useBlendModeButton(value,
  onChange)` picks `DropEmpty`/`DropFilled` based on `value === BlendMode.normal`, a `BlendModeMenu`
  lists `FACE_BLEND_MODE_GROUPS` (the pass-through-free grouping already shared with the vector
  tool). The difference: the vector version reads/writes a global "paint currently being edited by
  the vector tool" Redux slice (`selectPaint`/`setPaintBlendMode`), while this one is fully
  props-driven (`value: BlendMode`, `onChange?: TFunc<[BlendMode]>`) like the rest of `ColorPicker`
  — it doesn't know about a specific fill or Redux at all.
- **Threading**: `blendMode`/`onBlendModeChange` were added as optional props all the way down
  `ColorPicker` → `PaintTypeRow`, and all the way up `FillRow` → `ColorPickerInput` → `ColorPicker`,
  the same shape as `onImageChange`/`onVideoChange` etc. already used. `FillRow.tsx` wires
  `blendMode={paint.blendMode ?? BlendMode.normal}` and a new one-liner hook,
  `FillRow/hooks/useSetFillBlendMode.ts` (`onChange({ ...paint, blendMode })`), for the commit —
  same shape as the existing `useRotateImagePaint.ts`.
- **Persistence across paint-type switches needed no new work.** `blendMode?: BlendMode` already
  lived on `TPaintBase` (shared by every paint type), and every `useConvertTo*Paint`/
  `useHandleSolidPaintChange` hook in `FillRow/hooks/` was already carrying `blendMode:
  paint.blendMode` through when building the new paint object — scaffolding that predates this
  feature and had no UI to exercise it until now.
- **Canvas rendering needed zero changes.** `drawBoxLeafNode.ts` (the drawer for
  `TFrameNode | TRectangleNode | TSectionNode`, i.e. every node type `FillSection` is used on)
  already calls the exact same `drawVectorFillGroup(...)` used for vector-node face fills, passing
  `node.fills` straight through as the `paint: TPaint[]` argument. That function already does
  `getFaceGroupBlendMode(paints)` (first paint in the array with a non-normal, non-pass-through
  `blendMode` wins) and isolates+composites the whole fill stack with `compositeBlend` when one is
  found. So wiring the UI to write `paint.blendMode` was the entire feature — the WebGL side had
  been rendering it correctly all along, just with nothing in the picker ever setting it.
- **Real bug caught before shipping, not by the user**: the English/Polish label
  `"Apply blend mode"` was reused verbatim from the vector tool's (`"Apply blend mode to face"`,
  genericized) without noticing the RightPanel's node-level **Appearance** section already has its
  own button with that exact same accessible name
  (`design.rightPanel.panelProperties.common.appearanceSection.blendMode.ariaLabel`). Both buttons
  end up in the DOM simultaneously whenever a shape is selected with its fill picker open (the
  Appearance section's button lives in the always-visible properties panel, not inside the picker
  popover), so `getByLabel('Apply blend mode')` in the new e2e test resolved to two elements and
  failed with a Playwright strict-mode violation — caught immediately by running the new e2e test,
  before it ever reached the user. Fixed by renaming this button's label to
  `colorPicker.blendMode.ariaLabel = "Apply blend mode to fill"`. **Any new aria-label added near an
  existing RightPanel section should be checked against sibling sections' labels, not just against
  other components in the same file** — accessible names are a page-wide namespace, not a
  per-component one.
- **Circular-import gotcha**: `BlendModeMenu.tsx` destructuring `UITools.PopoverCompound` at module
  top level (copied from `FaceBlendModeMenu.tsx`, which does the same thing safely) broke every test
  that imports `FillRow` — `TypeError: Cannot read properties of undefined (reading
  'PopoverCompound')` — because `BlendModeMenu` sits inside `ColorPicker`'s own module tree, which
  the `shared` barrel re-exports; destructuring off the barrel at import time raced its own
  initialization. Every other `UITools.Foo` access inside `ColorPicker/**` either happens lazily
  inside a component's render body (already-resolved by then) or imports the concrete component by
  its full path instead of through the barrel (`ColorPicker.tsx` itself does `import Popover from
  'shared/UITools/Popover/Popover'`, not `import { Popover } from 'shared'`) — `BlendModeMenu.tsx`
  now does the same: `import { PopoverCompound } from 'shared/UITools/Popover/Popover'`.

### Stroke section (paints, default 1px inside stroke drawn on the canvas)

`Common/StrokeSection` is `<FillSection property="strokes" />`: the whole Fill machinery is parameterized by
`TPaintProperty = 'fills' | 'strokes'` (`types/design/paint/types.ts`). `Frame`/`Rectangle` nodes carry an
optional `strokes: TPaint[]` next to `fills` (plus the older `strokeWidth` / `strokeAlign`, defaulted to **1** and **inside** when the first stroke is
added — `commitFills`; `StrokeAlign` also has `center` / `outside`). Helpers `getNodePaints(node, property)` / `getPaintsChange(property, paints)` in
`utils/design/paint/`. Rows are the same `FillRow` (all tabs, blend mode, contrast, reorder/hide/remove) with
stroke translations (`getPaintTranslationNamespace`), and **no image editor / crop toolbar** (`editorNodeId` is
`undefined` for strokes, so `useSyncImageEditor`, resume-focus and scale-mode editor hooks never target them; the
picker's Crop option is still listed but inert). Canvas-side, `gradientEditor` and `patternSourcePickTarget` carry
an optional `property`: the gradient handle drawing/hit-testing (`getGradient*AtPoint`, `drawGradientHandleLayer`,
`armGradient*OnPointerDown`) read `getNodePaints(node, gradientEditor.property)` and the `continueGradient*Drag`
handlers write through `getPaintsChange(selectGradientEditor(state)?.property, …)`, so handles work for stroke
gradients. `FillSection` takes an optional `footer` (rendered under the rows only while there are paints); `StrokeSection` passes `StrokeSettingsRow` (`SectionColumn` with Position dropdown, Weight field and the Advanced / Individual strokes buttons). Position writes `strokeAlign`, Weight writes `strokeWidth`, and the second button (`StrokeSidesMenu`, a `Popover` of `PopoverItem`s) picks `strokeSides` (`StrokeSides`: all / top / bottom / left / right / custom; the trigger shows `Stroke`, `StrokeTop`…, and `Stroke` again for custom). Frame/Rectangle nodes carry optional `strokeTopWidth|RightWidth|BottomWidth|LeftWidth`, only meaningful for `custom`; a single side uses `strokeWidth` for that side and 0 elsewhere. `utils/design/stroke/` holds the model: `getStrokeSideWidths` (effective widths for any mode), `getStrokeSidesChange` (mode switch: to *all* takes the largest side, to a side keeps its width, to *custom* seeds the four widths), `getStrokeWeightChange` / `getStrokeSideWidthChange`, `getStrokeWeightDisplay` (null ⇒ the main field shows *Mixed*; typing there sets all four sides) and `getStrokePaddings` / `getPaddedRect` (per-side outer padding from `strokeAlign`). In custom mode the four side fields are extra cells of the same `SectionColumn` grid (`SectionColumn` skips its labels bar when there are no labels). **Everything that used a single stroke padding now uses the four per-side paddings**: `getSelectionOutlineBounds` (local frame, for resize/rotate hit-tests), `getSelectionOutlineDrawRect` (centre moved with the rotation, for `drawRect`/corner handles), `getStrokedRotatedNodeBounds` / `getStrokedSelectionBounds` (guides, snaps, distance guides), `getCollidedNodes` (marquee), `getStrokeExpandedNode` (hit-test), the size label (`getSelectionSizeLabelPlacement` `paddings`), the frame name label (`getFrameNameLabelAnchor`), `getBoxStrokePolygons` (outer/inner rounded rect with per-side offsets; the corner radius moves by the average of its two sides) and `getFrameLayoutPadding` (auto-layout inside-stroke padding per side). A frame's stroke is painted **after its children** (`renderFrameNode`: `paintLeaf(node, 'fill')`, children, `paintLeaf(node, 'stroke')`; `hasFrameStrokeOverChildren` forces the layered renderer). Known gap: a child's own inside-stroke inset in auto-layout still uses the single `strokeWidth`. **Stroke settings panel** (`StrokeSettingsRow/StrokeSettingsButton/`): the Advanced (`Properties`) button opens a moveable `Popover` docked to the right panel's left edge (same recipe as `CornerSmoothingButton`: `usePanelEdgeSideOffset`, `side="left"`), 240px wide, with a header (title + close), tabs Basic / Dynamic / Brush as a `UITools.ToggleButtonGroup` (it now accepts a text `label` instead of an `icon`) and, on Basic, four rows (Style, Width profile + flip, Join, Miter angle) built as a 32px-high container (`StrokeSettingsField`) whose control column is a fixed 128px; the controls keep their own height. Option sets live in `StrokeSettingsBasicTab/constants.ts` and are turned into dropdown/toggle options by `getStrokeStyleOptions` / `getStrokeProfileOptions` / `getStrokeJoinButtons` (labels via translation keys). `StrokeProfile` (`types/design/enums.ts`) and `constant/strokeProfile.ts` hold the width-profile enum, order, image map (`@xigma/assets/images/stroke-profiles/*.png`; Uniform is a plain 80x4 div) and `STROKE_PROFILES_FLIPPABLE` (wedge, taper and quarterTaper enable the flip button; uniform/eye/mirroredTaper are already symmetric and don't need it) — `StrokeSettingsWidthProfileField` is real local state now (`useStrokeSettingsWidthProfileField`, mirroring `useStrokeSettingsBasicTab`'s style state), not the hardcoded `DEFAULT_STROKE_PROFILE` it used to render. The tabs are the node's **stroke mode** (`StrokeMode` basic / dynamic / brush, `strokeMode` on Frame/Rectangle, written by `useStrokeSettingsPanel` with history; `getStrokeModeChange` resets sides to *all* with the largest weight when entering dynamic). A dynamic stroke disables the Position dropdown (showing Center) and keeps the individual strokes button in the DOM but `visibility: hidden` so the row does not shift; entering dynamic also writes `strokeAlign: center`. The Dynamic tab's Frequency (1-2000%, default 75) / Wiggle (>= 0, no upper limit, default 30) / Smoothen (0-100%, default 50) are real: they write `strokeDynamicFrequency|Wiggle|Smoothen` (`useStrokeSettingsDynamicTab`, `getStrokeDynamicValueFromInput`, limits in `StrokeSettingsDynamicTab/constants.ts`), and `getBoxStrokeRingPolygons` (mode priority dynamic > dashed > profile > uniform) hands the centre-aligned ring to `getBoxDynamicStrokePolygons`, which resamples the outer/inner loops, moves both along the path normal by `wiggle% x strokeWidth x noise(distance)` (seeded value noise from the node id, one control point per `2 x strokeWidth / (frequency/100)` of perimeter, smoothstep-blended by Smoothen, wrapped so the loop closes) and keeps the stroke width constant. Frame/Rectangle only; dynamic ignores dash, join and width profile. **Miter angle** (`strokeMiterAngle`, 7.17-180, default 28.96, scrubbable, shown only for Miter on Outside/Center): a box corner is 90 degrees, so `getBoxStrokeJoin` turns Miter into Bevel once the angle is >= 90. **Dashes** (`strokeStyle` solid/dashed/custom, `strokeDash`, `strokeGap` — follows Dash until edited, `strokeDashes` list, `strokeDashCap` none/square/round): `getStrokeDashPattern` builds the pattern; `getBoxStrokeRingPolygons` switches (dashed > width profile > uniform) and for dashed `getBoxDashedStrokePolygons` cuts the aligned outer/inner loops into one polygon per dash, measured along the stroke centre line, scaled so a whole number of repeats fits the perimeter, with a half dash at the path start (like Figma). Square caps lengthen each dash, round caps add a half-disc, both clamped to half the gap so neighbouring polygons never overlap (the stencil fill is even-odd, overlaps would punch holes). Box strokes only (frame/rectangle); dashed ignores Join and the width profile. Dashed adds Dash / Gap (disabled) / Dash cap rows, Custom adds Dashes / Dash cap, and any dashed style disables the Width profile dropdown (tooltip) and its flip button. Rows are `StrokeSettingsField`s (32px container, 128px control column). The Brush tab's brush picker is **not** a generic `Dropdown` — a real `Dropdown` popup made no sense for 25 image-heavy options across two categories, so `StrokeBrushTrigger` (a plain button styled like the large dropdown trigger, showing the selected brush's `StrokeBrushPreview` + `ChevronDown`) opens a dedicated `StrokeBrushPicker` instead, docked exactly like `ColorPicker`'s own `DockedPanelContext` pattern: `StrokeSettingsPanel` provides a sibling-local `StrokeSettingsDockedPanelContext` (reset to `null` on every tab change) and renders `{dockedPanel}` in a `.StrokeSettingsPanel__docked` div positioned `position: absolute; right: 100%; bottom: 0;` (left of, bottom-aligned with, the Stroke settings popover — same 240px width). `useStrokeBrushPicker(brush, onBrushSelect)` owns the open/closed state and pushes/clears that context's `ReactNode`; selecting a brush calls `onBrushSelect` then closes. `StrokeBrushPicker` itself is a fixed 240x510 panel reusing `StrokeSettingsPanelHeader` (now takes an optional `title` override; its height is 40px, not the earlier 48px) with title "Brushes", then a `scrollbar-hidden`-mixin scrollable list of `StrokeBrushCategorySection`s (32px category header) each rendering `StrokeBrushOption` rows (68px: a 24px check+label header, then the brush image filling the remaining height — `StrokeBrushPreview` is `height: 100%; width: auto` for exactly this, not the earlier fixed-width version) with a hover background matching `ButtonIcon`'s and a `--color-selected` background on the selected row. Clicking outside both the trigger and the picker closes it (`useCloseBrushPickerOnOutsideClick`: a two-ref `mousedown` listener, needed because the picker is a context-teleported sibling, not a DOM descendant of the trigger). Hovering a row **previews** it live — `useStrokeBrushPicker` wires `onOptionHoverStart`/`onOptionHoverEnd` to call `onBrushSelect` with the hovered brush while the pointer stays over the row, and reverts to whatever brush was active when the picker opened (`originalBrushRef`) the instant the pointer leaves without a click; only an actual click (`onSelect`) commits the brush and closes the picker. This never touches the rows' own hover/selected CSS — `selectedBrushId` is captured once at open time, so the checkmark/selected background stays pinned to the officially committed brush and never follows the live hover preview. Picking a brush from the *scatter* category (`getBrushCategoryId`) swaps the Direction toggle for `StrokeScatterBrushFields` (Gap, Wiggle, Size jitter, Angular jitter, Rotation, each wrapped in a `Tooltip` whose content mirrors its own label) — since the preview dispatches through the same `onBrushSelect`, hovering a scatter brush swaps the form live too, reverting along with the value. Since that live preview can swap the Brush tab's own form height (Direction row vs. the 5-field scatter form), naively anchoring the docked panel with CSS `bottom: 0` would drag it along with every reflow underneath it; instead `StrokeSettingsPanel` measures the docked panel's on-screen `top` once, the first layout pass after it opens (`useDockedPanelPosition`, a `useLayoutEffect` keyed on the `dockedPanel` node's identity, calling `getDockedPanelTop(container, docked)` — a `getBoundingClientRect()` diff), and then pins it there via an inline `top` (overriding `bottom: 0`) for the rest of that open session, regardless of how much the panel underneath grows or shrinks afterwards. A Direction toggle (left is the mirrored `ArrowRight`, `iconFlipped` on `ToggleButtonGroup`), a divider and the shared `StrokeSettingsWidthProfileField` follow. Both Dynamic and Brush (any non-basic `strokeMode`) disable Position (showing Center), hide the individual strokes button and reset the sides to *all*. **Brush** (`strokeMode: brush`, also writes `strokeAlign: center`): `strokeBrush` (id from `@xigma/utils` `BRUSH_CATEGORIES`, default `heist`), `strokeBrushDirection` (`StrokeBrushDirection` left/right) and, for scatter brushes, `strokeBrushGap` (>= 1%, default 45), `strokeBrushWiggle` (>= 0, default 0), `strokeBrushSizeJitter` (0-100), `strokeBrushAngularJitter` (0-180 deg, default 180), `strokeBrushRotation` (-180..180 deg, default 179), all via `useStrokeSettingsBrushTab` (hover preview = silent `updateNode`; the click commits through `useStrokeBrushPicker`'s `onBrushCommit`, which first restores the original brush so undo goes back to it). The `@xigma/assets` brush PNGs are black S-curve *previews* (756x108, alpha only), so they are used as vector shapes, not textures: `utils/brushes/` loads a PNG once (`brushShapeCache` `getBrushShape`, async `loadBrushAlpha` via fetch + canvas), `getBrushCenterline` fits a smoothed centre line through the per-column middle of the opaque pixels, `extractBrushStrip` straightens the S-curve into a strip (each cell sampled along the centre line's normals, `scale` = the 95th-percentile half thickness so v=+-1 is the thickest part of the brush), `traceBrushContours` runs marching squares on it (holes come out as their own loops, `simplifyBrushLoop` = Douglas-Peucker) and `getBrushScatterStats` derives cloud width/coverage; the result is cached per brush id. `getBoxBrushStrokePolygons` (memoised by geometry in `memoizeBrushPolygons`, key includes whether the shape has loaded) maps the contours onto the loop with `getBoxTracedBrushPolygons` (u = distance along the loop, v = across, x the Width profile, right = clockwise from the top-left corner, image-up = outside), then the polygons go through the normal stencil paint pipeline so solid/gradient/image strokes all work; until the PNG has loaded (and if it fails) the older procedural fallback below is drawn. **Stretch fallback** (`getBoxStretchBrushPolygons`): outer/inner loop resampled along the centre line (`buildStrokeRing`/`sampleStrokeRing`/`getStrokeRingDistances`), width = linear taper from the path start to `taperEnd` x the Width profile multiplier, rough edges from two seeded noise octaves, a few small ellipse holes (even-odd cut-outs); Direction right starts at the top-left corner clockwise, left runs the other way; per-brush look from `getBrushStretchPreset(index)`. **Scatter** (`getBoxScatterBrushPolygons`, always procedural, cloud sigma taken from the PNG stats when loaded): stamps every `Gap% x strokeWidth` along the loop (constant pitch, first stamp on the start, capped at 2500 stamps / 30000 dots), each stamp a gaussian cloud of hexagon dots (`getBrushScatterPreset`), Wiggle offsets stamps (sigma = 0.75 x wiggle x size, both axes), Size jitter scales a stamp (about 0.4-1.6x at 100%), Angular jitter/Rotation rotate it, the Width profile scales stamp size. Dots are packed into 40-dot chunks, each chunk one closed path (dots joined by bridge edges that are walked out and back so they cancel) so one fan draw per chunk; `drawBoxLeafNodeStrokePaints` passes a persistent face-buffer cache for brush strokes and `getVectorFillBounds` no longer spreads huge point arrays into `Math.min`. Frame/Rectangle only; brush ignores dash and join. **Join** writes `strokeJoin` (`StrokeJoin` enum: miter / bevel / round) with history via `useStrokeSettingsBasicTab`; `getBoxStrokeRingPolygons` passes it to `getBoxStrokePolygons`, which for bevel/round rebuilds only the OUTER loop's corners (radius = the corner's average side offset; bevel is the same arc with 1 segment, i.e. a chord). It only shows for Outside/Center strokes on shapes with no corner radius and no non-uniform width profile (the profile paths don't take a join, and the index-based inner/outer lerp needs equal point counts). e2e in `stroke-section.spec.ts`. Image strokes have the same Crop/Tile editing as image fills: `imageEditor`, `imageFillPickerFocus` and `TSelectedImageCrop` carry an optional `property` (`'strokes'`), every canvas/panel reader goes through `getNodePaints(node, imageEditor.property)` and writers through `getPaintReplaceChange`. Crops live in world coordinates, so every move/rotate/resize/nudge/clone path also transforms the stroke crops via `getCropPaintChanges` / `getOriginalCropPaintChanges` (strokes get their own anti-compounding cache key, `getStrokesCacheKey`). The bottom image toolbars (Edit, Crop) are fills-only. The stroke IS drawn: `drawBoxLeafNode/` (split into
`drawBoxLeafNodeFill`, `drawBoxLeafNodeStroke` (legacy solid `strokeColor`), `drawBoxLeafNodeStrokePaints`,
`drawBoxPaints`, `resolvePatternPaintTile`) paints `strokes` through the same `drawVectorFillGroup` as the fills,
but over a ring — `getBoxStrokePolygons` returns [outer, inner] outlines (world-unit width via
`getStrokeAlignInset`, rounded corners offset, collapsing inner when thicker than the node) and the stencil's
even-odd rule fills only the band; paints map to the node's own bounds like fills. Contrast background
is unchanged: it always reads the **fills** of the ancestors (never their strokes), ending at the page
background, since the canvas has no border. e2e #516 in `fill-section.spec.ts`.

### Effects section (`Common/EffectsSection`)

Sits under Stroke on Frame and Rectangle. The node stores `effects?: TEffect[]` (`blur`, `color`, `opacity`, `spread`, `type: EffectType`, `visible?`, `x`, `y`; defaults in `constant/effect.ts`, built by `utils/design/effects/createEffect`). The header keeps the apply-styles button and the plus; the plus is an `EffectsMenu` (`Popover` of `EffectTypeItems`, no check slot, Shader after a separator). Only Inner shadow and Drop shadow work (`isEffectSupported`); the other types are disabled items, and only Inner shadow, Drop shadow, Noise, Layer blur and Background blur are drawn on the canvas so far (see `canvas-rendering-pipeline.md` §14). `getEffectPanelLayout(effect)` decides what the settings panel shows: shadows get Position / Blur / Spread / Color and the blend mode droplet; Layer blur and Background blur get only the `EffectBlurModeToggle` (Uniform / Progressive — the toggle sets `effect.blurType`; Progressive shows Start (`startBlur`, default 0) and End (`blur`) fields) and the Blur field, no droplet.

`useEffectsSection` owns add / change / remove / toggle-visibility (each one `updateNode({ changes: { effects } })`), the open panel index (`useOpenPickerIndex`, reset when the selected node changes) and a local selection. Reordering reuses the Fill drag: `useItemsReorderDrag<TItem>` (generic now, with `getFillReorderResult` / `commitFillReorder` / `handleFillReorder`) plus `FillDropIndicator`. `EffectRow` = grab handle, a bordered trigger button (icon + name; blue-2 icon and text and `--color-bg-selected` while open, selected or dragged), eye, minus. Clicking the trigger opens `EffectSettingsPanel` in a moveable `Popover` docked to the right panel's left edge (`usePanelEdgeSideOffset`, 240px). The panel header has the effect name with a chevron (a menu to change the type, `EffectTypeItems` with checks), the blend mode droplet (the shared `BlendModeButton` with an `ariaLabel` override; empty drop for Normal, filled otherwise; saved as `effect.blendMode`) and close. Body rows are 32px `UITools.Field`s with a 136px control column: Position (X, then Y in a second row with no label), Blur (min 0), Spread and Color (`ColorPickerInput simple`, opacity as %). Hovering an option in the panel's blend mode menu previews it on the canvas: the shared `BlendModeButton` / `BlendModeMenu` take an optional `onPreview(blendMode | null)` (called on option enter / leave, and with `null` when the menu closes), `useEffectBlendModePreview(nodeId, openIndex)` writes it to `refs.blendMode.effectPreviewRef` (`{ blendMode, effectIndex, nodeId }`, cleared when the open panel changes or unmounts), and the renderer reads it through `getEffectBlendModePreview`. Numbers commit on blur through `handleEffectNumberBlur` / `getEffectNumberFromInput` and step with the arrow keys. New icon in `@xigma/components`: `Spread` (Blur reuses `LayerBlur`). e2e in `e2e/design/panels/effects-section.spec.ts`.

### Layout guide section (`Common/LayoutGuideSection`), Frame only

Sits under Effects, imported only in `Frame/Frame.tsx` (never `Rectangle.tsx`) — Figma-style Grid / Columns / Rows guides for a frame's own canvas, not the ruler/manual snap guides (`TGuide`/`guides?: TGuide[]`, an unrelated pre-existing field). The node stores `layoutGuides?: TLayoutGuide[]` (`type: LayoutGuideType`, `color`, `opacity`, plus per-type fields read through `getLayoutGuideFieldValue(guide, field)` with defaults from `constant/layoutGuide.ts` so switching type never has to backfill the other type's fields: `size` for Grid; `count`, `gutter`, `margin`, `width`/`height` and `columnsAlign`/`rowsAlign` — `LayoutGuideColumnsAlign` left/right/center/stretch, `LayoutGuideRowsAlign` top/bottom/center/stretch, both default `stretch` via `getLayoutGuideColumnsAlign`/`getLayoutGuideRowsAlign` — for Columns/Rows). The plus adds a Grid guide directly, no menu (`createLayoutGuide(LayoutGuideType.grid)`, mirrors `FillSection`'s plain-add, not Effects' type-menu plus). `useLayoutGuideSection` reuses `FillSection`'s generic hooks unmodified (`useItemsReorderDrag`, `useOpenPickerIndex` keyed `'layoutGuides'`, `useClearFillSelectionOnOutsideClick`, `resolveFillDragIndices`) and only adds the domain-specific `commitLayoutGuides`/`createLayoutGuide`/`toggleLayoutGuideVisibility`, mirroring `useEffectsSection` (no dedicated hook spec either, by the same precedent). `LayoutGuideRow` has three separate controls, not one bordered pill like `EffectRow`: a plain 24px `ButtonIcon` (the guide's type icon, `triggerTooltip` "Layout guide settings") that is the trigger for the full `LayoutGuideSettingsPanel` popover (`selected` only tracks that popover's own `isOpen`, not row selection/dragging); next to it a bordered dropdown-styled button (label from `getLayoutGuideRowLabel` — "Grid {size}px" / "{count} columns" / "{count} rows" — plus a `ChevronDown`) that opens a separate small `LayoutGuideTypeItems` popover and changes `guide.type` directly, no full panel; then the eye and delete `ButtonIcon`s. The row itself carries `--selected` (`var(--color-bg-selected)`) while selected or mid-drag, clickable via a plain `onClick={onSelect}` on the row root (`onSelectRow` just replaces the local selection with `[index]`, no shift/meta range — simpler than `FillSection`'s Redux-backed `useFillSelection`, sufficient since layout guides don't need cross-render-persisted selection). `LayoutGuideSettingsPanel` mirrors `EffectSettingsPanel`'s shape (own `LayoutGuideSettingsHeader` with the same type-Popover-menu + close pattern as `EffectSettingsHeader`) but switches its whole field list per type via a `switch` into three sibling components (`LayoutGuideGridFields`/`ColumnsFields`/`RowsFields`, each still reusing `UITools.Field` and `EffectColorField` straight from `EffectsSection` — both are already effect-agnostic) rather than one generic `fields.map` array, since Width/Height needs a disabled "Auto" placeholder while `stretch`; numeric fields go through `LayoutGuideNumberField` (`ScrubbableEdge`, no icon adornment — Figma's own guide fields are plain numbers) and a `useLayoutGuideSettingsPanel` hook that mirrors `useEffectSettingsPanel`'s blur/scrub handlers 1:1 against `TLayoutGuide` instead of `TEffect`. Canvas: `drawLayoutGuides` (`drawScene/drawLayoutGuides/`, called right after `drawGridSlots`) draws every visible frame's guides — not just the selected one — gated by the `design.preferences.areLayoutGuidesVisible` pref (default **on**; `toggleLayoutGuidesVisible`, wired to the `Shift+G` shortcut and the two previously-disabled "Layout guides" stub `MenuItem`s in `ViewMenu`/`ZoomMenu`, same recipe as `areRulersVisible`/`toggleRulers`/`handleToggleRulers`, minus the on-screen hint toast). `utils/canvas/layoutGuides/getLayoutGuideRects(guide, frame, lineWidth)` (`switch` on type) returns plain `TDrawableRect[]` — Grid as thin (`1 / viewport.zoom`-wide) horizontal+vertical rects from 0 to width/height in `size` steps; Columns/Rows as `count` bands whose width/height is either evenly stretched across `frame.width|height - 2*margin - gutter*(count-1)` or the guide's own fixed `width`/`height`, positioned per `columnsAlign`/`rowsAlign` (`left`/`top` = after margin, `right`/`bottom` = before margin, `center` = centered, `stretch` = from the margin) — then every rect is run through `clampRectToFrameBounds` (intersect against `[frame.x, frame.x+width] x [frame.y, frame.y+height]`, drop empty results) **before** rotation, since `drawRect` rotates whatever it's given around the frame's own center (`getAutoLayoutFrameCenter`) the same way `drawGridSlots` does — this is what stops a guide (e.g. a fixed pixel size that doesn't divide evenly, or a `left`/`top`-anchored set wider than the frame) from ever painting outside the frame's own bounds, matching Figma. Icons (`LayoutGuideGrid`/`LayoutGuideColumns`/`LayoutGuideRows`) live in `@xigma/components` (`xigma-app-shared`), added there and pulled in, per [[xigma-icons]]'s workflow.

### Selection colors section (`Common/SelectionColorsSection`), Frame only

Sits between Effects and Layout guide, imported only in `Frame/Frame.tsx` — a purely derived, read-through-and-write-back view (nothing new is stored on the node), listing every distinct solid/gradient color used anywhere inside the selected frame: its own `fills`/`strokes` plus every descendant's, walked with `getGroupSubtreeNodes(frame, nodesById)` (self at index 0, then every child recursively — the same subtree walker `collectDescendantIdsOfSelected` uses) filtered to `isAppearanceNode` (only Frame and Rectangle carry `fills`/`strokes` in this codebase so far) and `!node.hidden`. `useSelectionColorsSection` also returns `hasChildren = (node?.childIds.length ?? 0) > 0`; `SelectionColorsSection` renders nothing at all (not even a muted empty header) when it's false, so a leaf frame with no children never shows this section, even if the frame itself has its own colors — it would just duplicate what Fill/Stroke already show.

The section is only a collapsible disclosure once there's something to hide: `isCollapsible = groups.length > MAX_SELECTION_COLOR_PREVIEW` (3). With 3 or fewer colors, `SelectionColorsSection` passes `UITools.Section` its plain string `label` (and `mutedWhenEmpty`) exactly like Fill/Stroke/Effects, and the row list always renders — no chevron, no click target, nothing to toggle, since a short list has nothing worth collapsing. Past 3 colors, it flips to `label={undefined}` and renders its own `SelectionColorsSectionHeader` as the first child instead (`Section`'s own header only supports a plain string), with the row list gated behind `isExpanded` (`useToggleSelectionColorsExpanded`, mirrors `useToggleLayersExpanded`'s exact shape — `isExpanded` state plus `handleToggleClick`/`handleToggleKeyDown`, Enter/Space toggle too; starts collapsed). This threshold check is why an idle "check if I should collapse" concept never existed as its own flag — the row count is already known synchronously (`groups.length`) at render time.

Collapsed, `SelectionColorsSectionHeader` shows the label plus `SelectionColorPreview` — up to `MAX_SELECTION_COLOR_PREVIEW` small swatches (`rgba` from each group's hex+opacity, via `getSelectionColorPreview`, a pure `{ visibleGroups, overflowCount }` slice) and a trailing `+N` for the rest; expanded, the preview disappears and the row list renders below instead. The header is a `role="button" tabIndex={0}` div (`aria-expanded`), mirroring `Layers.tsx`'s header div. The `ChevronRight` icon (matching `LayersHeaderTitle`'s pattern: same icon in both states, only a CSS `transform: rotate(90deg)` on `--expanded` — no icon swap) is **absolutely positioned** (`position: absolute; left: 0; top: 50%`, header itself `position: relative`) rather than sitting inline before the label — this is deliberate, not decorative: with the chevron in normal flex flow, "Selection colors" would start further right than every other section's plain-string label (all of which sit flush at the header's own `padding-left: 16px`); pulling the chevron out of flow via `position: absolute` (which resolves against the parent's *padding* edge, so `left: 0` lands inside that same 16px gutter) lets the label stay the first real flex child, keeping its left edge pixel-identical to Fill/Stroke/Effects/Layout guide's headers regardless of whether the chevron is showing. Its own `opacity: 0` default is only revealed by `&:hover &__chevron { opacity: 1; }`, local to `selection-colors-section-header.module.scss` — this applies identically whether collapsed or expanded (the `--expanded` modifier only ever touches `transform`, never `opacity`), so the chevron is hidden at rest in both states and only shows up while the pointer is actually over the header row; no shared/global CSS attribute involved (an earlier version tried threading a generic `Section`-level hover-reveal attribute through for this, and a later one kept it unconditionally visible once expanded — both reverted once it turned out a single plain local `:hover` rule, with no expanded-state exception, was what was actually asked for). `&__label` also carries `min-width: 0` (a flex item's default `min-width: auto` pins it to its content's width and blocks shrinking, so it's the right thing to have regardless), but that wasn't why the trailing `+N` looked flush against the header's edge with none of the breathing room `Stroke`/`Effects`' plus `ButtonIcon` gets: a `ButtonIcon` is a fixed 24×24 box, so its glyph sits well inside the header's `padding-right: 8px` with extra room from the box itself; a bare `+N` text span has no such box, so at the *same* 8px padding it visually reads as flush. Fixed by giving the overflow text the same 24×24 box: `SelectionColorPreview` wraps it in `&__overflowContainer` (`width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;`), matching `ButtonIcon`'s own dimensions exactly so the count sits at the same visual inset as any other section's trailing icon. The header also carries a `--muted` modifier — `cx(..., { '--muted': !isExpanded })` — applying the exact same `&--muted:not(:hover) { color: var(--color-neutral-2) }` treatment `Section--muted` gives Fill/Stroke's empty-state label, but driven by `!isExpanded` instead of `!hasContent`: with nothing shown below a collapsed header (the row list is hidden, only the swatch preview stands in for it), the label reads as dim/idle the same way an empty section does, and turns full-bright the moment it's expanded (or while hovering, matching the same hover-reveals-brightness convention). `getSelectionColorOccurrenceEntries` flattens each appearance node's `fills` then `strokes` into `{ occurrence: { index, nodeId, property }, paint }` entries, skipping `paint.visible === false` and anything that isn't `isSelectionColorPaint` (solid or a `gradient-*` type — image/video/pattern/shader paints never appear in this list, matching "only solid and gradient count as a color" from the spec). `groupSelectionColorEntries` then buckets those entries by `getSelectionColorSignature(paint)` — a plain string key built from the paint's own identity fields (`color`+`opacity` for solid; `type`+`stops`+`start`+`end`+`radiusRatio`+`opacity` for gradient) plus `blendMode ?? BlendMode.normal`, so a fill and a stroke of the same hex merge into one row (an explicit `blendMode: 'normal'` and an omitted one are treated as identical), and a different blend mode on an otherwise-identical color stays a separate row. Because the whole group list is recomputed fresh from live node state on every render (`collectSelectionColorGroups`, `useMemo`d on `node`/`nodesById` in `useSelectionColorsSection`), there is no separate "merge on edit" code path: editing a row's color to match another existing row's value, or changing its blend mode to match one, simply collapses to the same signature on the very next render — the two `data-no-select`-free UX rules the user asked for ("editing this shouldn't duplicate an existing color" / "the same edit through the right panel field should do the same thing") fall out of this for free.

The row itself (`SelectionColorRow`) reuses `FillRow`'s own hooks unmodified — `useHandleSolidPaintChange`, `useConvertSolidToGradientPaint`, `useSetFillBlendMode` (all pure, keyed only on a `paint`/`onChange` pair, no fill-specific state) — and its swatch-hex-alpha utils (`getFillRowSwatchHex`, `getFillRowHexDisplayValue`, `getFillRowInitialActiveTab`), wrapped through `UITools.ColorPickerInput` exactly like `FillRow`, minus the eye toggle (no single `isVisible` makes sense for a merged group) and minus `contrastBackgroundColor`/`contrastUnsupportedReason` (omitting both keeps `ContrastCheckerButton` from ever rendering — Selection colors never checks contrast, per spec). In place of Fill/Stroke's eye+minus, each row ends with two more `ButtonIcon`s, both given a `SelectionColorRow__actionIcon` class so they stay `opacity: 0` until hovering their own row (`&:hover &__actionIcon { opacity: 1 }` in `selection-color-row.module.scss`), the same per-row reveal `FillRow`'s own drag handle uses — not a section-wide hover (an earlier version tried a shared `Section`-level `data-section-hover-reveal` attribute for this; corrected back to plain per-row `:hover` once it turned out that wasn't what was wanted). `StylesAndVariables` (same icon `ApplyStylesButton` uses in other section headers) is still wired with no `onClick` — a placeholder, not yet functional. The second — icon name `Shield` (a concentric-circle "target" glyph despite the name, matching Figma's own "select layers with this color" icon) — does something real: `onSelectNodes` (from `useSelectionColorsSection`) dispatches `setSelection(getSelectionColorSelectionNodeIds(group.occurrences, nodesById))`. `getSelectionColorSelectionNodeIds` dedupes `occurrences` to unique node IDs, then walks every node's `parentId` chain and drops any node that turns out to be a **descendant** of another matching node in the same set — the parent always takes priority over a matching child, so selecting a color used by both a frame and one of its own descendants selects only the frame, never the (redundant, already-covered) descendant; this generalizes past one level, so of three nested matches only the outermost ancestor ends up selected. `setSelection` is already in the app's own `UNDOABLE_ACTION_TYPES` list, so no extra history-gesture wrapping is needed here. The button's tooltip/`ariaLabel` say how many nodes clicking it will actually select — `useSelectionColorsSection` exposes `getSelectionCount(occurrences)` (same `getSelectionColorSelectionNodeIds(...).length`, just read instead of dispatched), and `SelectionColorsSection` passes `getSelectionCount(group.occurrences)` down as `SelectionColorRow`'s `selectionCount` prop, interpolated into `t(selectTooltip, { count })`/`t(selectAriaLabel, { count })` — both keys use i18next's `_one`/`_few`/`_many`/`_other` plural suffixes (matching `common.timeAgo.*`'s existing convention) rather than a single fixed string, so the count reflects the post-parent-priority number, not the raw (possibly larger, possibly double-counting fill+stroke) occurrence count.

**Every edit — the row's own inline hex/alpha fields and everything inside the open panel (hue/saturation drag, the panel's own hex/RGB/HSB fields, presets, the blend mode menu) — commits live**, exactly like `FillRow`: `SelectionColorRow` dispatches through `onChange` straight away, with no local buffering, so the canvas and every other row see the edit immediately. What's special to this section is that the *grouping* freezes the row you have open instead of the commit: `useSelectionColorsSection` keeps `openGroup: { key, occurrences } | null` (a snapshot taken the moment a row's panel opens, from that row's own `group` object) and threads `openGroup.occurrences` into `collectSelectionColorGroups`/`groupSelectionColorEntries` as `pinnedOccurrences`. While a set of occurrences is pinned, they're grouped with each other exactly as before, but never allowed to merge into a *different* group even if a live edit makes their value coincide — that specific set of occurrences (the currently-open row) always stays its own group, with a `key` that only depends on that frozen occurrence set, never on the value. The freeze is lifted the instant the panel closes (`onOpenChange(group, false)` clears `openGroup`), so the very next recompute groups everything purely by value again, merging the edited row into whatever it now matches.

This exists because committing live *and* grouping purely by value at the same time breaks the panel: since the whole group list is recomputed fresh from store data every render (see above), picking a color that happens to match another existing entry while the panel is open would instantly merge the two groups' occurrences — changing the open row's `key` mid-edit, remounting it, and dropping the open panel right out from under the cursor ("click something inside the picker and it closes"). Pinning keeps the row's identity — and therefore the mounted `ColorPicker`/Popover instance — stable for as long as it's open, while still letting every value update reach the store (and hence the canvas) the moment it happens; only the *visual reflow* of the list (the actual merge into one row) waits for the close. Regression coverage: `groupSelectionColorEntries.spec.ts`/`collectSelectionColorGroups.spec.ts` (pinning kept apart from, and merging within, a pinned set), `useSelectionColorsSection.spec.tsx`'s "should keep a color edited live... until it closes", and `SelectionColorsSection.spec.tsx`'s "should update the store live from a color picked inside the open panel, while keeping its row from merging until it closes" / "should keep the picker open after editing a value inside it" tests.

New shared capability, not Selection-colors-specific: `ColorPickerTab.shader` already existed as an icon-only placeholder tab (Fill's own picker shows it too, see the Effects/Stroke section above), but until now `PaintTypeRow` always rendered all six type tabs unconditionally. Added `availableTabs?: ColorPickerTab[]` (`TColorPickerProps` → `ColorPicker` → `TColorPickerInputProps` → `ColorPickerInput`, defaulting to a new `ALL_PAINT_TYPE_TABS` constant so every existing caller is unaffected), and wrapped each of `PaintTypeRow`'s six tab buttons in `availableTabs.includes(tab) &&`. `SelectionColorRow` passes `SELECTION_COLOR_TABS = [solid, gradient, shader]`, so its picker's type-switch row only ever offers those three, matching "editing a merged color can only turn it into another solid/gradient/shader, never an image" from the spec.

Committing an edit (`useSelectionColorsSection.onChange(occurrences, nextPaint)`) fans a group's `occurrences` back out across every distinct `(nodeId, property)` pair they span (`groupOccurrencesByNodeProperty`), replaces only the matched indices in each node's own paint array with `{ ...nextPaint, visible: <that occurrence's own original visible> }` (`getSelectionColorNodeChanges` — preserving each occurrence's own `visible` literal, not the representative paint's, since two occurrences merged into one group can each carry `visible: true` or `undefined` — both "visible", but not necessarily written the same way), and dispatches one `updateNode` per affected node through the existing `dispatchAsOneGestureIfMultiNode` (`components/Design/Canvas/utils/`) so editing a color shared by several nodes is still a single undo step, while a solo occurrence stays a plain single dispatch (no gesture wrapping overhead). `openGroupKey` (which row's picker/popover is open) is local `useState<string | null>`, keyed by `group.key` — **not** `group.signature`. This distinction is load-bearing, not cosmetic: `signature` is derived from the paint's own *value* (its whole point is to change the instant you edit hex/opacity/blend mode, so editing into another row's value collapses the two), while `key` (`getSelectionColorGroupKey`, sorted `nodeId:property:index` occurrence strings joined) is derived from group *membership* and stays the same across a value edit. `React key={group.signature}` (and `isOpen={group.signature === openSignature}`) was the first version of this, and it broke the picker: `ColorPickerInput` only renders the actual mounted `ColorPicker`/Popover while its `isOpen` prop is true (the closed state is a completely different, bare `<button onClick={onTriggerClick}>`, see `ColorPickerInput.tsx`'s `startAdornment` branch) — so the moment any edit inside the open picker changed the paint (hence the signature), `isOpen` flipped false on the very next render and the whole `ColorPicker` subtree unmounted mid-interaction, i.e. "click anything inside the picker and it closes". Swapping both the React `key` and the open-tracking to the value-independent `group.key` fixed it — regression test: `SelectionColorsSection.spec.tsx`'s "should keep the picker open after editing a value inside it".

### Export section (`PanelProperties/Export`), Frame and Rectangle, plus a NoSelection stub

Sits after Layout guide on `Frame.tsx` and after Effects on `Rectangle.tsx`; the same component is also rendered (unchanged) from `NoSelection.tsx`. Row list/settings are still purely local component state (`useExportSection`, plain `useState<TExportSetting[]>`, reset via a `useEffect` keyed on `node?.id`) — there is no `exportSettings` node field, nothing is persisted or undoable. `useExportSection` derives `node` from `selectSelectedNodes` (only when exactly one node is selected) purely to decide whether to show the "Export {name}" button/preview below the row list — it doesn't gate the row list itself, which is why the same component also works from `NoSelection` (no node, rows still addable, just no button/preview). **Clicking "Export {name}" now does a real PNG/JPEG export** (see "Real PNG/JPEG export generation" below) — PDF rows export through the hybrid PDF pipeline (see "PDF export" below), SVG rows export through a sibling hybrid SVG pipeline (see "SVG export" below). Every setting in the row and its popover now affects the actual output: Scale/Format/Suffix/Ignore overlapping layers/Image resampling/Color profile/Include bounding box/Outline text/Include "id" attribute (a JPEG's encoder quality comes from the row's own Quality setting — `ExportQuality` high/medium/low → `EXPORT_JPEG_QUALITY` 0.92/0.75/0.5 — a dropdown shown in the settings popover while the row's format is JPEG **or PDF**, since a PDF's raster fallback layer can also be JPEG-encoded at this quality, see "PDF export" below; independent of Color profile). Outline text shows for SVG/PDF only, Include "id" attribute for SVG only, Include bounding box for every format (matching Figma's own SVG/PDF/PNG export dialog, which this stage's UI mirrors directly — see "Bounding box / outline text / id attribute" below).

Each `ExportRow` has, inline, a Scale and a Format `UITools.Dropdown` (both `variant="outline"`, the bordered-background style — `ExportScale`/`ExportFormat`, feature-local `enums.ts`, not `types/design/enums.ts`, since neither is part of node schema; scale members are identifier-safe (`half`, `oneAndHalf`, `width512`, …) with the actual `"0.5x"`/`"512w"` strings living only in translations, keeping the enum's member-equals-value convention intact), then a `MoreOptions` `ButtonIcon` opening `ExportSettingsPanel` in a `usePanelEdgeSideOffset` popover (mirrors `LayoutGuideRow`'s edge-docked settings popover, 280px), then a `Minus` delete button. Rows are drag-reorderable once there are 2+ of them (`canDrag={settings.length > 1}`, same threshold as Fill/Effects/Layout guide): `useExportSection` reuses `FillSection`'s generic `useItemsReorderDrag`/`resolveFillDragIndices` unmodified, with its own local `settings` `useState` array as the `commit` target instead of a `dispatch(updateNode(...))` — no history-gesture wrapping (`beginHistoryGesture`/`endHistoryGesture`) is needed here since this state isn't Redux-backed/undoable yet. `ExportRow` gets the same absolutely-positioned `RowGrabber` handle as `LayoutGuideRow` (`opacity: 0` at rest, revealed on row hover or while dragging), and `Export.tsx` renders the shared `FillDropIndicator` inside its (now `position: relative`) rows container. Rows are also click-to-select once `canDrag` (2+ rows), same `--selected` treatment (`var(--color-bg-selected)`) as `LayoutGuideRow`: `useExportSection` tracks its own local `selectedIndices` (single-select, `onSelectRow` replaces the array wholesale) and wires `FillSection`'s generic `useClearFillSelectionOnOutsideClick` against the rows container; the click handler is Export's own `useSelectExportRow` (a byte-for-byte local copy of `LayoutGuideRow`'s `useSelectLayoutGuideRow` — kept local rather than imported, since that hook lives under `LayoutGuideRow`'s own feature folder, not a shared one). Since Scale/Format now use plain `UITools.Dropdown` (not a custom `data-no-select`-able trigger), clicking them also marks the row selected as a side effect — matching the same already-accepted behavior of `LayoutGuideRow`'s own eye/delete buttons, which don't carry `data-no-select` either. While the row's own settings popover is open it instead gets `--pickerOpen` (`background-color: var(--color-neutral-3)`), matching `FillRow`'s own `--pickerOpen`/`--selected` pair exactly (declared after `--selected` in the SCSS, so it wins on cascade order whenever both classes are present at once) — a deliberately different, more prominent background than the plain click-`--selected` one, so opening a row's settings visibly differs from just clicking to select it. `ExportSettingsPanel`'s header mirrors `EffectSettingsHeader`/`LayoutGuideSettingsHeader` exactly (40px, `padding: 0 12px`, `border-bottom: 1px solid var(--color-neutral-3)`, `font-weight: 550` title, an `__actions` wrapper around the close button) minus the type-switcher, since there's only one "type" here — just a plain title span on the left. Body: `UITools.Field` rows (Suffix `UITools.TextField`, Color profile and Image resampling `UITools.Dropdown`s, each given `controlWidth={100}`; `Field` takes the wrapped component as `Component`, inherits its props, draws the 32px row with the label on the left and stretches the control into the column) plus `UITools.Field` checkbox rows (`Component={UITools.Checkbox}` with `labelInside`, since a checkbox owns its label) for "Ignore overlapping layers" (default `true`). No per-row eye toggle — wasn't in the spec. The header's title is "Export settings" (`settings.title`), not a bare "Export" — the outer `Section` is already labelled "Export", so the popup needs its own, more specific title rather than repeating the section's label verbatim, matching how `EffectSettingsHeader`/`LayoutGuideSettingsHeader` show the row's own specific name instead of the enclosing section's.

The "Export {name}" button and the Preview disclosure only render once `settings.length > 0 && node` — both gates independently required, so a selected node with zero rows shows nothing extra, and (from `NoSelection`) any number of rows shows nothing extra either, since there's no `node`. Preview reuses `UITools.Accordion` (one item, `label: "Preview"`) — no bespoke chevron/collapse code was needed here, unlike Selection colors' own header, because a plain single-item accordion is exactly what a "click to reveal one thing" preview needs. `TAccordionItem` grew three optional fields for this: `icon?` (default `'Triangle'`, `AccordionItem`'s previous hardcoded glyph), `iconRotation?: { collapsed; expanded }` (default `{ collapsed: -90, expanded: 0 }`, matching Triangle's old fixed CSS values exactly — the rotation is now applied via an inline `style={{ transform: 'rotate(...)' }}` instead of a static SCSS rule, since the degree is caller-supplied and can't be a fixed class), and `className?` (merged onto the header button via `cx`). Export passes `icon: 'ChevronRight'`, `iconRotation: { collapsed: 0, expanded: 90 }` (a right-pointing chevron rotating to point down on expand, not Triangle's own -90/0 scheme, since the two glyphs point differently at their own 0deg), and `className: styles.ExportPreview__header` — a doubled-selector override (`&__header.ExportPreview__header { padding-left: 0; }`) to zero out `AccordionItem__header`'s own `padding-left: 8px`, the same "guard against unpredictable cross-file cascade order" trick used for `ExportSettingsPanel__input`. The other existing consumer (`FrameTool`'s frame-preset accordion) is unaffected — it passes none of the three new fields, so it keeps Triangle at -90/0 exactly as before (only now expressed as an inline style rather than a static CSS rule, which is why its own snapshot needed a one-line update). The thumbnail itself is a **real render** of the node's current on-screen appearance, not a placeholder: `useExportPreview(nodeId)` calls `samplePatternThumbnail(nodeId, EXPORT_PREVIEW_SIZE)` — the same global sampler `usePatternThumbnail` (pattern-fill source picking) already uses, registered against the render loop via `registerPatternThumbnailSampler`/`resolvePatternThumbnailRequest` and rendering the node's subtree into an offscreen framebuffer sized to fit `256x256` preserving aspect ratio (`renderPatternSourceThumbnail`, scale = `min(size/w, size/h)`), read back with `gl.readPixels` and turned into a `data:image/png` URL (`createImageDataUrlFromPixels`). Despite the "pattern thumbnail" naming, the renderer is fully generic (any node ID, not just pattern fill sources — `collectPatternSourceSubtree` is just "self + descendants"), so Export reuses it directly instead of building a parallel offscreen-render pipeline; only a thin feature-local wrapper hook (`Export/hooks/useExportPreview.ts`) exists, mirroring `usePatternThumbnail`'s effect/cancellation shape 1:1. The preview is a fixed 210x210 box (`ExportPreview__texture`) tiled with the same `blank-media.png` texture the color picker's Image/Video tabs use behind their source preview (`background-size: 208px 208px`, referenced by its own `url()` in Export's own SCSS rather than importing the picker's stylesheet), with the thumbnail (`ExportPreview__image`, `background-size: contain`, centered) layered on top — so transparent areas of the export show the texture instead of a flat color.

Rows are keyed and addressed by array **index** (`onChange(index, next)`/`onRemove(index)`), matching `EffectsSection`/`LayoutGuideSection`'s own convention (no `id` field on `TExportSetting`) rather than generating UUIDs.

#### Real PNG/JPEG export generation

Clicking "Export {name}" (`useHandleExportClick(node, settings)`, wired as the button's `onClick`, `disabled={isExporting}`) renders every raster (`png`/`jpeg`) row at its own scale, packs more than one file into a zip, and downloads the result — `Export/utils/exportNode.ts` is the orchestrator: filters to `isRasterExportFormat` rows, computes unique file names up front (`getExportFileNames`, `nodeName + suffix + extension`, later duplicates numbered `" (2)"`, `" (3)"`, …, so two rows with the same suffix/format never collide), renders+encodes each row in parallel (`Promise.all` over `createExportFile`), then `downloadBlob`s the single file directly or zips everything first (`createExportZipBlob`, `jszip` — a new dependency, this repo had no zip library before) and downloads `${nodeName}.zip` when there's more than one. A row that fails to render (or reports zero eligible rows) is just dropped, not retried or surfaced as an error.

- `getExportScaleFactor(scale, bounds)` turns an `ExportScale` member into a plain multiplier: the six fixed members (`half`/`threeQuarters`/`one`/`oneAndHalf`/`two`/`three`/`four`) map to constants, `width512`/`height512` divide 512 by the node's own rotated-bounds width/height (`getRotatedNodeBounds`, the same canonical util the pattern-thumbnail pipeline uses) — an exhaustive `switch` with no `default` (`oxlint-disable-next-line default-case`, matching this repo's existing convention for enum-exhaustive switches, e.g. `drawVertexCountHandlesLayer.ts`).
- `createExportFile(nodeId, format, scale, fileName, ignoreOverlappingLayers)` calls `renderNodeForExport(nodeId, scale, ignoreOverlappingLayers)` (the export-render registry, below) then `createImageBlobFromPixels(pixels, width, height, mimeType, quality)` — a sibling of the existing `createImageDataUrlFromPixels` but returning a `Blob` via `canvas.toBlob(...)` instead of a data URL via `canvas.toDataURL(...)`, so the result is usable both for a direct download and as a zip entry. `EXPORT_FORMAT_MIME_TYPE`/`EXPORT_FORMAT_EXTENSION` (`Export/constants.ts`) map every `ExportFormat` member to its MIME type/file extension (svg/pdf entries exist for type-completeness but are never reached, since `isRasterExportFormat` filters them out first).
- `downloadBlob(blob, fileName)` (`src/utils/downloadBlob.ts`, global since it's Design-agnostic) is the repo's first "save a file to disk" helper — `URL.createObjectURL` + a throwaway `<a download>` + `.click()` + `URL.revokeObjectURL`.

**Export-render registry** (`utils/canvas/exportRender/`) mirrors the existing pattern-thumbnail registry byte-for-byte (`registerExportRenderer`/`renderNodeForExport`, a module-level `activeRenderer` singleton), but is a genuinely separate pipeline from `patternThumbnail`'s, not a reuse of it — a thumbnail is deliberately capped/fit to a square preview size, while an export needs an exact pixel scale (up to 4x or a fixed 512px dimension) with no square-fit distortion. `useRegisterExportRenderer(refs)` (mounted in `Canvas.tsx` next to `useRegisterPatternThumbnailSampler`) files a `refs.exportRenderRequestRef` request (`{ ignoreOverlappingLayers, nodeId, onResolve, scale }`) the same way the thumbnail sampler does; `resolveExportRenderRequest` (called from `startRenderLoop`'s `tick`, next to `resolvePatternThumbnailRequest`) picks it up on the next animation frame, resolves which nodes to draw via `getExportRenderNodes`, then calls the shared GL core, `renderNodeAtScale(context, nodeId, nodesToDraw, nodesById, refs, scale)`.

`renderNodeAtScale` is `renderPatternSourceThumbnail`'s old body, generalized twice over: instead of receiving a `size` and computing `scale = min(size/w, size/h)` internally (a "fit inside a square" policy), it receives the `scale` directly and multiplies the node's rotated bounds by it; and instead of deciding for itself which nodes to draw (it used to call `collectPatternSourceSubtree` internally), it now takes an explicit `nodesToDraw: TSceneNode[]` parameter — the caller decides the node list, this function just draws exactly that list into the target and reads it back. `renderPatternSourceThumbnail` is now a thin wrapper that computes the fit-to-square `scale` from its own `size`, builds `collectPatternSourceSubtree(sourceNodeId, nodesById)` itself (self + descendants, its own existing behavior, unaffected by the new setting), and delegates to `renderNodeAtScale` for the actual FBO render/readback (target creation, viewport/blend-state save-restore, `drawLeafNode` per node, `gl.readPixels`). This is a pure refactor — `renderPatternSourceThumbnail`'s own existing spec and its output are unchanged — so the export path and the pattern-thumbnail path now share one render core with two different node-list/scale-selection policies on top of it.

**Bug: layer blur (and background blur, glass, blend mode) never rendered in any exported file — fixed by giving export a second, effect-aware render strategy.** `renderNodeAtScale`'s flat `nodesToDraw.forEach(node => drawLeafNode(...))` loop only ever calls the bare per-shape paint function — it never reaches `applyBackgroundBlur`/`applyGlassEffect`/`renderIsolatedBlendNode` (`drawSceneNodes/renderNode/renderNode.ts`), the effect dispatch the **live canvas** runs for every node via `drawSceneNodes.ts`. So a node with layer blur exported as a sharp, unblurred shape in every format (PNG/JPEG use this render path directly; SVG/PDF's raster fallback for any node with visible effects — `canExportBoxShapeAsSvgVector`/`canExportBoxShapeAsVector`'s eligibility gate — routes through the exact same broken path). Background blur/glass/blend mode share the identical root cause (call-graph evidence: `applyBackgroundBlur` is only ever reached from `drawSceneNodes.ts`/`renderNode.ts`, neither of which `renderNodeAtScale` called), even though only layer blur happened to be the one reported.
  - The `TRenderTarget | null` "target" parameter this render system passes around has a non-obvious special case: `null` means "the visible on-screen canvas" (`bindTarget` does `gl.bindFramebuffer(FRAMEBUFFER, null)`), not "whatever's currently bound" — so naively calling the live canvas's `renderIds(renderer, [sourceNodeId], null)` from inside an export would have periodically rebound the *real visible canvas* mid-export instead of staying on the export's own offscreen framebuffer. The fix passes the export's own `TRenderTarget` (already built by `createTarget`, which returns exactly that shape) as a real non-null target instead — the same pattern already used for effect isolation nested inside another isolated context, just applied at the top level.
  - Split into `drawScene/renderExport/`: `renderExportTarget.ts` (the shared GL target lifecycle — create/bind/clear/save-restore/readPixels/dispose, extracted verbatim from the old flat file, taking a `draw(renderContext, target)` callback), `renderNodeAtScale.ts` (unchanged public behavior/signature — the flat `nodesToDraw` loop, now just one caller of `renderExportTarget`), and `renderNodeSubtreeAtScale.ts` (new — builds a `TMaskRenderer` sourced from the **whole document** `nodesById` and calls `renderIds(renderer, [sourceNodeId], target)`, the same recursive `childIds`-driven per-node dispatch the live canvas uses, so background blur/glass/layer blur/blend mode — and, as a side effect, real `clipContent`/mask fidelity — now match the live canvas exactly for a single exported subtree).
  - `resolveExportRenderRequest` picks between the two — **note "Ignore overlapping layers" defaults to `true`**, so getting this condition backwards (an early version of this fix did) means the fix silently never fires for the common case: `includeNodeIds` set, or `ignoreOverlappingLayers === false` → the old flat `renderNodeAtScale` (`includeNodeIds` is an arbitrary cross-subtree subset — e.g. a raster-layer run of several merged, not-necessarily-related nodes — that can never reduce to one subtree walk; `false` means "respect the whole document's real z-order", which is also not a single subtree). Otherwise — `ignoreOverlappingLayers === true` (the default) and no `includeNodeIds` — → `renderNodeSubtreeAtScale`, since `renderIds(renderer, [sourceNodeId], target)` by construction only ever visits `sourceNodeId` and its real descendants, which **is** exactly "this node's own subtree, ignoring anything outside it" — the literal meaning of "ignore overlapping layers" — so this mode gets real clip/effect fidelity for free instead of `collectPatternSourceSubtree`'s flat, unclipped, effect-blind list. `renderPatternSourceThumbnail` (pattern-fill preview sampling) always uses the flat path unconditionally, unaffected by this fix, since it exists specifically to sample content ignoring clip.
  - No e2e coverage for this fix (asked explicitly, declined) — real blurred-pixel correctness needs a real WebGL context (jsdom has none), and this repo has no existing download-interception/file-decode e2e infrastructure to build on; the unit tests instead assert the wiring (`renderIds` called with `[sourceNodeId]` and the export's own non-null target, `TMaskRenderer` built the same way `drawSceneNodes.ts` builds it) at 100% coverage.
  - **Second, deeper bug found only via live testing (unit tests couldn't catch it): the shared render target pool is also screen-sized, unconditionally.** `createRenderTargetPool(gl)`'s `acquire()` always sizes every pooled scratch texture to `gl.drawingBufferWidth`/`gl.drawingBufferHeight` — the real, visible canvas — regardless of what's actually bound when `pool.acquire()` is called. Every isolated-effect step (`renderIsolatedContent`'s `contentTarget`, `captureBackdropTexture`'s backdrop, glass's fresh-warp/frost targets, texture's clip-shape/output targets) pulls its scratch buffer from `renderer.pool`, which — before this fix — was always `context.imageContext.renderTargetPool`, the **one singleton shared with the live canvas**. So even after fixing every pixel-ratio/scissor-rect formula (the note above), the actual isolated content still got painted into a scratch texture sized for the real screen, at the wrong scale/position relative to export's own much smaller target — producing exactly the corrupted/offset fragments seen in live testing (this is why the pixel-ratio fix alone didn't resolve it; both bugs had to be fixed together).
    - Fix: a second pool implementation, `createFixedRenderTargetPool(gl, width, height)` (`utils/canvas/renderTarget/createRenderTargetPool/`), always allocates targets at the given fixed size instead of reading `gl.drawingBufferWidth/Height` — same acquire/release/dispose recycling logic as the original pool, just without its live-resize-invalidation behavior (unneeded for a one-shot export render). Confirmed via `git diff`-level coverage comparison against a clean checkout that every caller file's statement/branch counts are identical to baseline (plus my own new lines, all 100% covered) — the device-pixel-ratio fix introduced zero coverage regressions on its own, it just wasn't sufficient by itself.
    - **First attempt only swapped `TMaskRenderer.pool`, which missed every consumer that reaches the pool a different way — a real gap, not a hypothetical one (surfaced by live testing: Noise texture still rendered wrong after this pool fix).** `drawNoiseMask.ts` (and `drawEffectIsolated.ts`, `renderNodeListToPatternSourceTile.ts`, `drawVectorFillGroup.ts`) never receive a `TMaskRenderer` at all — they only get a plain `context: TDrawSceneContext` and read `context.imageContext.renderTargetPool` directly, since dropShadow/innerShadow/noise are drawn as part of every box node's ordinary paint sequence (`drawBoxEffects`), not gated behind the isolated-blend dispatch `TMaskRenderer` exists for. Swapping only `renderer.pool` left every one of these untouched, still pulling screen-sized scratch textures.
    - **Real fix: swap the pool inside `imageContext` itself, once, in `renderExportTarget.ts`** — `renderContext.imageContext = { ...imageContext, renderTargetPool: createFixedRenderTargetPool(gl, width, height) }` — so every consumer of `context.imageContext.renderTargetPool`, whether reached through a `TMaskRenderer` or directly through `context`, known today or added later, transparently gets the export-sized pool with no per-file changes. `renderNodeSubtreeAtScale.ts`'s own `TMaskRenderer.pool` now just reuses `renderContext.imageContext.renderTargetPool` instead of creating a second, separate fixed pool. The pool is created and disposed once per export render, in `renderExportTarget.ts`, regardless of which of the two render strategies is used — `renderNodeAtScale`'s flat `drawLeafNode` loop benefits too, since dropShadow/innerShadow/noise are drawn there via the very same `drawBoxLeafNode` → `drawBoxEffects` path.
    - Order matters when swapping `imageContext`: `isAlphaWriteEnabled` is a stateful flag `setAlphaWriteEnabled` mutates on `imageContext` directly (not returned/threaded explicitly), so the pool-swapped `imageContext` object is built *after* the initial `setAlphaWriteEnabled(gl, imageContext, true)` call, not before — otherwise `renderContext.imageContext.isAlphaWriteEnabled` would carry the stale pre-render value into `draw()`.

**Third recurrence of the same bug class: `gl.FRAMEBUFFER_BINDING` save/restore around `pool.acquire()` is a footgun with three distinct failure shapes, not one.** `createTarget()` (called internally by `pool.acquire()` whenever no recycled target is free) ends by leaving the framebuffer bound to `null` as its own documented side effect — harmless for every caller that immediately does an *explicit* `gl.bindFramebuffer(...)` afterward, but silent poison for any caller that instead trusts "whatever's currently bound" as ground truth. Found and fixed three separate instances of this, each shaped differently enough that fixing one did not catch the others:
  - **`captureBackdropTexture.ts` (glass/blend-mode/clipped-frame backdrop capture, e.g. Frame `clipContent: true` with a child Glass/Noise/Text): read order was `pool.acquire()` *then* `gl.getParameter(FRAMEBUFFER_BINDING)`** — capturing the *already-corrupted* `null` as "previous", so the later restore rebound to the real on-screen canvas instead of the export's own offscreen target, and the backdrop copy read from whatever the live canvas happened to show. Fix: read `getParameter` before `acquire()`, matching the already-correct order used elsewhere in this file (e.g. `renderExportTarget.ts`).
  - **`drawNoiseMask.ts` (Noise effect, `EffectType.noise`, on any Rectangle/Frame — a *different* code path than the Texture/`clipToShape` noise post-process, dispatched straight from `drawBoxLeafNode` for every node with the effect, no `TMaskRenderer`/isolation involved): the exact same read-after-acquire ordering bug**, independently present since this file never shared code with `captureBackdropTexture.ts`. Symptom was dramatic and reproducible on a bare Rectangle with zero nesting: the entire exported bitmap came back as the noise shader's output painted over the *page's own background color* (`#444444`, uniform gray, confirmed via `PIL`/`pngjs` pixel sampling — not the rectangle's fill, not transparent), because after the mask helper returned with the binding corrupted to `null`, every subsequent draw call in `drawNoiseShape` (the actual noise quad) landed on the real visible canvas instead of the export's target, and the export's own final `readPixels` then read that same corrupted default framebuffer. Fix: same reordering.
  - **`renderFreshGlass.ts` (Glass effect, `EffectType.glass`, cache-miss path — the common case, since the glass cache's size check almost always misses at export resolution): a third *shape* of the same bug — no framebuffer read at all, just an unprotected acquire.** `applyGlassEffect.ts` correctly does `bindTarget(renderer, target)` right before dispatching into `renderFreshGlass`, but `renderFreshGlass` immediately calls `pool.acquire()` twice (`warped`, `mask`) with no save/restore around either — if either hits the cold-create path (near-certain for a freshly-created per-export `createFixedRenderTargetPool`, which starts with zero recycled targets), the correctly-bound `target` from two lines above is silently dropped back to `null` *before* `renderFreshGlassWarp` is even called, so its own (already-correct) `captureBackdropTexture` call reads `previousFramebuffer` as `null` too — same end symptom as the two bugs above (flat page-background-colored gray output), but the root cause is a sibling call corrupting ambient state the callee has no way to know about, not a local ordering mistake. This is why it only reproduced at some export scales and not others in testing: whether the first `pool.acquire()` call of a render is a cold create-or-reuse depends on incidental pool-fill state from earlier steps in the same render, not on scale directly. Fix: explicit `bindTarget(renderer, target)` right after the two acquires, before calling into `renderFreshGlassWarp` — belt-and-braces re-assertion rather than relying on `captureBackdropTexture`'s own internal save/restore to survive a sibling's unrelated acquire.
  - **Lesson for any future code in this render tree: never assume `gl.FRAMEBUFFER_BINDING` still holds what you last explicitly bound after calling *any* `pool.acquire()`, even one whose return value you don't otherwise touch yet.** Either read `getParameter(FRAMEBUFFER_BINDING)` strictly before the first `acquire()` in a function (not just before "the important" one), or re-assert the intended target with `bindTarget`/an explicit `bindFramebuffer` immediately after every `acquire()` that isn't immediately followed by its own explicit bind. All three bugs were invisible to the existing unit tests (mocked `gl`/`pool` objects don't simulate `createTarget`'s real unbind side effect) and were only found by a real headless-Chromium Playwright run exporting an actual scene and inspecting the downloaded PNG's real pixels (`page.evaluate` + dynamic `import('/src/store/index.ts')` to dispatch store actions directly, `download.createReadStream()` + `pngjs`/`PIL` to read real pixel bytes) — see the permanent regression coverage in `e2e/design/export.spec.ts` (`captureBackdropTexture`'s clip-content case and `drawNoiseMask`'s case share one regression: a Noise effect on a plain Rectangle exported at default settings; `renderFreshGlass`'s case needs a Frame with real sibling backdrop content and a 2x export scale to force the cold-acquire ordering that reproduces it).

**Bug: Glass (and any other backdrop-sampling effect) invisible/blank in the PDF and SVG raster fallback, even after the export-wide effect-aware fix above — a fourth, architecturally distinct instance of "the effect-aware renderer needs real content to work with."** PDF/SVG export split each exported node's flat, paint-ordered `nodes` list (`getExportRenderNodes`) into alternating **vector** layers (drawn as real `<path>`/PDF vector ops via `drawSvgShape`/`drawPdfShape` — crisp, scalable) and **raster** layers (anything vector-ineligible — a stroke gradient, a blend mode, an effect — grouped by `getSvgLayers`/`getPdfLayers` into consecutive runs of `nodeIds`, each rendered once via `renderNodeForExport(..., includeNodeIds)` and embedded as one `<image>`/PDF image XObject covering the *entire* export bounds at `(0, 0)`, stacked on top of the vector layers already drawn beneath it). Before this fix, that per-layer render request passed only `layer.nodeIds` — *just this raster run's own members* — as `includeNodeIds`, which (via the fix above) now goes through the real per-node effect dispatch instead of the old blind flat loop... but for a Glass/background-blur node, effect-aware dispatch still needs *something already drawn below it* to sample as backdrop, and a raster run rendered in total isolation from its vector-layer siblings has nothing there — the target starts fully transparent, so Glass composites against emptiness and comes out a near-invisible `(x,x,x, alpha≈26)` smudge, exactly like the export-wide bug looked before any of these fixes, just scoped to one PDF/SVG layer instead of the whole file. Confirmed via a real PDF export (Frame containing red/blue backdrop halves + a translucent Glass rect straddling the seam, all otherwise-vector-eligible except the Glass rect) with a temporary `window.__debugRendered` hook capturing the exact pixels `embedPdfRasterLayer` was about to embed — blank/transparent before, correctly red/blue-tinted after.
  - **Fix: each raster layer now renders its own *z-order prefix* — every node from the start of the exported subtree through this layer's own last member, in real paint order — not just its own `nodeIds`.** `getPdfLayers`/`getSvgLayers` track a running `seenIds` array while reducing over the flat `nodes` list (already in paint order) and snapshot it onto a new `contextIds: string[]` field every time a node is added to a raster layer (`addToRasterLayer(layers, node, contextIds)`), so `contextIds` always equals "everything visually beneath and including this layer, in this subtree" regardless of how many earlier vector-layer siblings that spans. `createPdfBlob.ts`/`drawSvgLayer.ts` pass `layer.contextIds` (not `layer.nodeIds`) to `embedPdfRasterLayer`/`embedSvgRasterLayer`, which build a fresh `Set` from it for `renderNodeForExport`'s `includeNodeIds`. Earlier opaque vector siblings end up redundantly redrawn *inside* this raster image (harmless — same pixels the vector layer beneath it already drew, since both come from the same source data) purely so Glass/blur has real content to sample; nothing *after* this layer in z-order is ever included, since `contextIds` is a prefix, not the whole document, so a later raster layer never gets painted into an earlier one.
  - **New effect-aware entry point, `renderNodeIdsAtScale.ts`, alongside the existing single-root-id `renderNodeSubtreeAtScale.ts`** (`drawScene/renderExport/`) — both now share `buildExportMaskRenderer.ts` (the `TMaskRenderer` construction that used to be duplicated inline in just the one file). `renderNodeIdsAtScale` takes an arbitrary `ids: string[]` instead of one `sourceNodeId`, and before calling `renderIds(renderer, ids, target)` it filters through **`getTopLevelIds(ids, nodesById)`** — drops any id whose ancestor chain (walking `parentId` up) also appears in the same `ids` array. This guards a real, if rarer, edge case the naive "just pass `contextIds` straight through" version would have hit: if a *Frame itself* (not just one of its children) needs the raster fallback (e.g. Glass applied directly to a clipping frame), `contextIds` would include both the frame and its own children as separate flat entries — rendering all of them as individual root ids would double-draw the children once via the frame's own recursive `childIds` walk and once via their own separate list entry. `getTopLevelIds` keeps just the frame in that case, letting its existing recursion draw the children once, correctly.
  - `resolveExportRenderRequest.ts`'s branch grew a third arm: `includeNodeIds` set → `renderNodeIdsAtScale` (this fix, always — regardless of `ignoreOverlappingLayers`, since `includeNodeIds` already names an exact, fully-resolved id list either way, just filtered from a different candidate pool); no `includeNodeIds` and `ignoreOverlappingLayers === false` → the old flat `renderNodeAtScale` (whole-document z-order, unchanged, since a bare PNG/JPEG export never sets `includeNodeIds` — only PDF/SVG raster-layer embedding does); no `includeNodeIds` and `ignoreOverlappingLayers === true` (the default, plain export) → `renderNodeSubtreeAtScale`, unchanged.
  - Not covered by this fix: a vector-layer sibling with its own blend mode or partial opacity would, if it ends up inside some later raster layer's `contextIds` prefix, get its blend/opacity effect *redundantly re-applied* on top of the already-blended vector-drawn copy beneath it in the final PDF/SVG — a narrower, currently-latent visual-correctness gap (mismatched result only for translucent/blended vector siblings specifically), left as a known limitation rather than blocking this fix, since the common case (opaque plain-fill backdrop behind a Glass/blur shape) is unaffected.
  - Permanent regression coverage: `e2e/design/export.spec.ts`'s SVG test decodes the raster layer's embedded `<image href="data:image/png;base64,...">` directly via `pngjs` (SVG inlines it as base64 text, far easier to assert on than parsing a PDF binary — the fix is shared code, so this test covers the PDF path too) and the PDF-specific 2x-scale test from the fix above already covers the plain-export-of-one-Glass-shape case end to end.

**"Ignore overlapping layers" now actually changes what gets drawn.** `getExportRenderNodes(nodeId, nodesById, rootOrder, ignoreOverlappingLayers)` (`drawScene/getExportRenderNodes.ts`) still exists and is still the decision point *when the flat renderer is in play* (see the blur-fix note above for when that is — no `includeNodeIds` and `ignoreOverlappingLayers === false`; `includeNodeIds` alone no longer implies the flat renderer at all, see the raster-layer-backdrop fix just above): for `true` it returns `collectPatternSourceSubtree(nodeId, nodesById)` — the node's own subtree, flat and unclipped; for `false` it returns the **entire document** in real paint order — `getRenderOrderedNodes(rootOrder, nodesById)` (the same flat, parent-before-children, paint-ordered list `selectRenderOrderedNodes`/the live `drawScene` itself is built from), filtered to `!node.hidden`. No bounds-intersection filtering is needed to "crop" this to the exported node's own area: `renderNodeAtScale`'s viewport transform already maps the node's own rotated bounds to fill the whole target framebuffer, so anything outside those bounds simply rasterizes outside `[0,width]×[0,height]` and never reaches `gl.readPixels` — the same way panning the live canvas naturally hides whatever's outside the visible viewport, with no manual clipping code required. This intentionally does not attempt real per-frame clip/scissor rects (nested `clipContent` frames) — a pre-existing simplification, unchanged for the flat, whole-document-z-order case. The plain `ignoreOverlappingLayers: true` (default) + no `includeNodeIds` case no longer goes through `getExportRenderNodes` at all — see the blur fix above, `renderNodeSubtreeAtScale` replaced it for that case with a real clip-aware tree walk.

**"Image resampling" (Basic/Detailed) changes actual texture filtering on Image/Video fills, threaded through `TDrawSceneContext` for free.** `TDrawContext` (`drawScene/types.ts`) grew an optional `imageFilterQuality?: TImageFilterQuality` field (`TImageFilterQuality = 'basic' | 'detailed'`, `src/types/canvas.ts` — a plain global type, not `ExportImageResampling`, since the canvas-rendering layer must not import a Design-panel-feature enum; `ExportImageResampling`'s members are already the literal strings `'basic'`/`'detailed'` so no conversion function is needed at the Export→canvas boundary, they're passed straight through). Every function already threading the whole `context: TDrawSceneContext` object along (`drawLeafNode` → `drawBoxLeafNode` → `drawBoxPaints` → `drawVectorFillGroup`) needed **zero** signature changes — the field just rides along for free inside `context`/its `{...context}` spreads. The seam is exactly where `drawVectorFillGroup` stops forwarding the whole `context` object and starts unpacking it into individual primitive arguments for `drawVectorFillPaints(gl, program, ..., isAlphaWriteEnabled, imageFilterQuality, boxRotation?)` — from there down it's a normal explicit parameter: `drawVectorFillPaints` → `drawVectorImageFill` (only for `paint.type === 'image' | 'video'`) → `drawImageTexture`, which is the one place that actually calls `gl.texParameteri`. Three other pre-existing call sites reach `drawVectorFillPaints` directly, bypassing `drawVectorFillGroup` (vector-node drag/resize/rotate drag-snapshots — `drawVectorNodeDragSnapshot.ts`/`drawVectorNodeResizeSnapshotFace.ts`/`drawVectorNodeRotateSnapshotFace.ts`), each fixed the same way (destructure `imageFilterQuality` off their own `context` and forward it).

`drawImageTexture.ts` sets `gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, quality === 'detailed' ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR)` right next to its pre-existing (already per-draw, not baked in once) `TEXTURE_WRAP_S`/`_T` calls — texture parameters in this codebase were already being re-set on every single draw call rather than once at creation time, so there's no "restore the previous filter afterward" dance needed: the *next* draw of that same cached/shared texture (whether on the live canvas or another export) just sets whatever filter mode it itself wants, unconditionally. `MAG_FILTER` always stays `gl.LINEAR` — mipmaps only ever matter for minification (downscaling), never magnification. `getOrLoadTexture.ts` now calls `gl.generateMipmap(gl.TEXTURE_2D)` right after each `texImage2D` upload (harmless/unconditional for every consumer, including the ones that never asked for mipmap filtering — WebGL2 supports NPOT mipmapping unconditionally, unlike WebGL1) so a mip chain always exists by the time any draw might request `LINEAR_MIPMAP_LINEAR`. The one-off placeholder texture (`getOrCreateImagePlaceholderTexture`, used when an image/video paint has no `ref` yet) never gets mipmaps generated, so `drawVectorImageFill.ts` explicitly clamps `resolvedFilterQuality` to `'basic'` whenever `!ref` — sampling an incomplete mip chain would otherwise render that texture as fully transparent black.

**Why "Basic" doesn't actually look sharper than "Detailed"'s old always-on `LINEAR`, and why that's the correct fix**: the visible softness the user was seeing on every export of a downscaled image was plain bilinear minification with no mipmap chain — the pre-existing, unconditional behavior everywhere in this app, matching what "Detailed" now also does (`LINEAR`, unchanged). Naively mapping "Basic" → `gl.NEAREST` would only trade blur for jagged/blocky aliasing, not fix anything. The real fix only exists on the "Detailed" side: `LINEAR_MIPMAP_LINEAR` correctly pre-averages the image at each mip level before sampling, which is what actually removes the softness when heavily downscaling. So "Basic" intentionally == "today's existing behavior, unchanged" and "Detailed" is the one that's new/improved — not a symmetric pair of equally-valid choices.

**"Color profile" (sRGB/Display P3) only tags the file — deliberately, to match Figma.** The row's `ExportColorProfile` is mapped down to the generic `TColorProfile` (`types/canvas.ts`) by `getColorProfileTarget` (`srgb` and `srgbSameAsFile` both collapse to `'srgb'`, since this app has no document-level working color space for "same as file" to mean anything else) and forwarded only to `createImageBlobFromPixels`, which does `getContext('2d', { colorSpace })` and `new ImageData(..., { colorSpace })` with `'display-p3'`/`'srgb'`, so Chrome embeds the matching ICC profile ("Display P3 Gamut with sRGB Transfer") in the PNG/JPEG. The rendering itself is completely unaware of the profile: pixels come out of `renderNodeAtScale` exactly as before (plain sRGB numbers) and are **not** converted — so under Display P3 the same numbers are read in the wider gamut and look more saturated (e.g. skin/cheek reds visibly redder).

This was a conscious product decision, verified numerically against a real Figma export of the same photo (source JPEG had no ICC profile = sRGB): Figma's Display P3 export keeps the source values (`224,182,176` stays `224,182,175`) and only retags them, whereas a colorimetrically correct conversion (which this file briefly implemented — a sRGB→P3 matrix applied in `hexToRgbFloat` via a module-level active-profile flag plus a wide-gamut `<canvas colorSpace="display-p3">` decode path for image fills, producing `217,184,176`, i.e. the same perceived color as the original) showed no visible difference from sRGB and was rejected in favor of matching Figma. If a truly accurate wide-gamut export is ever wanted (e.g. as a separate option), that earlier design is in git history (commit `05df5129`): hex→P3 conversion via one shared choke point (`hexToRgbFloat`/`hexToRgbaFloat` cover fills, gradients, strokes and shadow/noise effects), plus P3-aware image decode with a profile-aware texture cache key.

**Also fixed along the way, unrelated to color**: `exportNode.ts` used to fire every row's render concurrently via `Promise.all`, but `refs.exportRenderRequestRef` is a single slot, not a queue — with 2+ raster rows, every render after the first would silently overwrite the one before it before the render loop's next tick ever picked it up, leaving those earlier rows' promises permanently unresolved (`Promise.all` would hang forever, so clicking "Export" on a multi-row PNG/JPEG export never completed). Switched to a plain sequential `for...of` loop (one `createExportFile` fully awaited before the next starts) — this was a latent bug in the multi-row/zip export shipped earlier the same session, never caught by unit tests since they mock `createExportFile` directly and never exercise the real single-slot ref.

**Bounding box / outline text / id attribute** (`TExportSetting.includeBoundingBox`/`.outlineText`/`.includeIdAttribute`, all default `false`) — the three remaining fields from Figma's own SVG/PDF/PNG export dialog that this panel didn't have yet.

- **Include bounding box, and why the *default* had to change, not just add an opt-in.** Figma's real default is the *opposite* of what this app always did: Figma tight-crops the export to the actual visible content within the exported node's subtree, and "Include bounding box" opts into the full declared node size instead. This app's export always used `getRotatedNodeBounds(node)` (the selected node's own declared box) unconditionally, for all three formats — SVG, PDF and raster alike, confirmed by tracing PNG/JPEG's own render path (`renderNodeAtScale.ts`) back to the exact same `getRotatedNodeBounds` import SVG/PDF already used. So implementing this properly meant building a genuinely new capability (tight-crop content bounds) and making it the new default, not adding a simple pass-through flag.
  - **`getExportContentBounds(nodeId, nodesById)`** (`Export/utils/`, shared by all three formats) walks the export root's own subtree (`getExportSubtreeNodes`, a plain root-first pre-order `childIds` walk filtering `hidden` — deliberately a fresh, dedicated walk rather than reusing `collectPatternSourceSubtree`, since that function has an unrelated purpose — "ignore overlapping layers" — and doesn't filter hidden nodes, a pre-existing gap not worth inheriting here) and unions each node's own `getRotatedNodeBounds`, intersected against every `clipContent: true` Frame ancestor's own bounds along the way (`intersectWithClippingAncestors`, plain AABB intersection — an empty intersection means that node contributes nothing). A **Frame with no visible fill/stroke of its own doesn't contribute its own box, only its children do** (`contributesOwnBounds`, a `switch` on `node.type`: Group/Mask/Section never contribute at all, only pass through to children; every other leaf type — Rectangle/Ellipse/Polygon/Star/Line/Vector/Media/Text — always contributes unconditionally, no visibility check) — this is what lets the classic "icon designed in an oversized transparent frame" case crop tight to just the icon, the dominant real-world reason this setting exists at all. Falls back to the root's own `getRotatedNodeBounds` when nothing contributes (an empty/fully-clipped subtree), to avoid a degenerate zero-size export.
  - **Deliberate scope cut, not silently dropped**: stroke bleed (`strokeAlign: outside`/`center` extending past the shape's own box by half the stroke width) and effect bleed (a drop shadow's `blur`/`spread`/`x`/`y` extending well past the shape) are *not* accounted for — a shadow-only shape with an empty fill could get cropped away entirely. Figma's own tight-crop does account for both; this is a real, documented gap versus true Figma parity, not an oversight.
  - **`exportNode.ts` resolves fullBounds vs. contentBounds once per row**, not inside the format-specific blob builders themselves: it computes both `fullBounds` (`getRotatedNodeBounds`) and `contentBounds` (`getExportContentBounds`) up front, then picks `setting.includeBoundingBox ? fullBounds : contentBounds` per row before calling `createExportFile` — so the "Width 512"/"Height 512" scale modes (`getExportScaleFactor`) also correctly operate on whichever bounds that row actually asked for.
  - **Threading the override into the raster pipeline** required touching the export-render registry chain, not just `Export/utils/`: `TExportRenderer`/`TExportRenderRequest` (`utils/canvas/exportRender/types.ts`) grew an optional trailing `boundsOverride?: TDraftRect`, threaded through `renderNodeForExport` → `useRegisterExportRenderer`'s filed request → `resolveExportRenderRequest` → `renderNodeAtScale` (`boundsOverride ?? getRotatedNodeBounds(sourceNode)`) — the one place that actually sizes the output framebuffer and offsets the render viewport. Every parameter in this chain is optional/trailing, so every pre-existing caller (the live pattern-thumbnail sampler, every existing export test) is completely unaffected when it isn't provided.
  - **`createSvgBlob`/`createPdfBlob` themselves also kept `bounds` optional and trailing** (`boundsOverride?: TDraftRect`, defaulting internally to `getRotatedNodeBounds(node)` — the exact same fallback `exportNode.ts` uses for the "include bounding box" case) specifically so the two pre-existing, very large integration test suites (`createSvgBlob.spec.ts`/`createPdfBlob.spec.ts`, dozens of tests each, built up across every prior SVG/PDF export stage) didn't need touching at all — every old 5-argument call site keeps working unchanged, and only the small number of new tests exercising this stage's features pass the extra trailing arguments.
- **Outline text** (`outlineText`) forces every text node through the vector-curves tier instead of ever trying real `<text>`/PDF text — useful for guaranteeing identical glyph shapes across viewers/fonts, same as Figma's own checkbox description. `canExportTextAsOutline` (`Export/utils/`, shared by both formats) is a new, separate eligibility predicate — not a parameterized version of the existing on-path-only `canExportTextOnPathAsVectorCurves` — because that function *requires* `node.pathId` to resolve (its whole purpose is text-bound-to-a-path), while "outline text" must also work for perfectly ordinary straight text with no path at all. Its own eligibility mirrors `canExportTextOnPathAsVectorCurves`'s `isOwnStyleSupported` (own rotation, flip, stroke, blend mode, content) minus the `pathId` requirement. `createSvgBlob`/`createPdfBlob` compose the format's real-text and curves callbacks around this flag entirely in the caller closures passed into `getSvgLayers`/`getPdfLayers` — `(textNode) => !outlineText && canExportTextAsSvgRealText(...)` and `(textNode) => outlineText ? canExportTextAsOutline(...) : canExportTextOnPathAsVectorCurves(...)` — so `getSvgLayers`/`getPdfLayers`/the three-tier dispatch itself needed zero changes; both flattened-to-curves tiers ultimately land on the exact same `SvgLayerType.textCurves`/`PdfLayerType.textCurves` layer kind and drawer (`drawSvgTextCurves`/`drawPdfTextCurves`, which already accepted an `undefined` `pathNode` for straight, non-path text via `getTextFlattenVector`'s own existing contract).
- **Include "id" attribute** (`includeIdAttribute`, SVG-only — PDF's own object model has no equivalent concept) adds `id="<sanitized layer name>"` derived from each node's own `name` field. `getSvgElementId(node, usedIds)` (`Export/utils/svg/`) replaces every non-`[a-zA-Z0-9_-]` character with `_` and prefixes with `_` if the result doesn't start with a letter/underscore (a valid XML id can't start with a digit), then disambiguates duplicate sanitized names within one export via a `Map<string, number>` counter (`Icon`, `Icon_2`, `Icon_3`, …) threaded through the whole layer loop. The wrapping itself lives in `drawSvgLayer` (see the `createSvgBlob/` split below): every non-raster layer gets a `<g id="...">...</g>` wrapper around whatever markup that layer's own drawer produces — one `id` per exported *node*, not per individual `<path>`/paint-layer, even when a node has several stacked fills. Raster layers are excluded entirely (`layer.type !== SvgLayerType.raster`), since one coalesced raster snapshot can represent several unrelated source nodes at once, with no single meaningful id to give it.
- **`createSvgBlob` promoted from a flat file to its own `createSvgBlob/` folder** (`getSvgAncestorGroups`-style promotion, per this repo's "a function gets its own folder once it accumulates enough branching" convention) once this stage's changes (bounds resolution, the per-layer id-wrapping, the growing per-layer switch) made the single function too dense to read as one block: `createSvgBlob.ts` is now a thin orchestrator (resolve bounds, build the layer list, loop calling `drawSvgLayer`, assemble the final markup), `drawSvgLayer.ts` holds the per-layer ancestor-group-stack update + id-wrapping + type-switch dispatch (taking a bundled `TSvgDrawContext` — the run's constant values: bounds, nodeId, raster settings, `nodesById` — rather than nine separate parameters), and `getSvgBlobMarkup.ts` holds the final `<svg>`/`<defs>` string assembly. `createPdfBlob.ts` was not split the same way — it stayed a single file, since PDF's own per-layer switch never grew the same id-wrapping/bounds-resolution complexity SVG's did (no per-node `<g id>` concept to interleave).
- **Verified with a real generated SVG rendered via macOS Quick Look**: a 300×300 transparent frame containing a small orange icon rectangle and a triangle standing in for outlined text (real Inter font fetch isn't available under Vitest, same browser-API gap documented for the text-curves tier back in Stage 4 — `getVectorFillLoopPoints` was also mocked, same established technique used by every real `createSvgBlob.spec.ts` vector-fill integration test, to isolate the already-covered face-detection subsystem). The tight-crop export rendered as a 110×90 canvas with the icon and triangle flush to the top-left, correctly excluding the empty margin; the same scene with `includeBoundingBox: true` rendered as the full 300×300 canvas with the same content positioned exactly where it sits in the design — confirming the two modes produce the expected, visually different canvases from the same source content, not just different numbers in an unrendered string. Both outputs carried the sanitized `id="Icon_Shape"`/`id="Icon_Label"` attributes, and the text rendered as a real `<path>`, never `<text>`.

**"Exporting..." Snackbar**: `design.isExporting` (`store/design/slice.ts`, optional field — deliberately `isExporting?: boolean` rather than a required `boolean`, since a required field on `TDesignState` would force every one of the ~30 pre-existing test files across the codebase that hand-build a literal `TDesignState` object to add it; `selectIsExporting` reads it via `Boolean(...)`, matching the existing `isGridSettingsPanelOpen?`/`selectIsGridSettingsPanelOpen` precedent exactly) is set `true` right before `exportNode(...)` and cleared in a `finally` (so a thrown/rejected export still clears it) by `useHandleExportClick`. `Design/Toolbar/ExportHint/ExportHint.tsx` is a new sibling of `DesignHint`/`MediaToolHint` inside `Toolbar.tsx`'s row, reusing the shared `Snackbar` component and the exact same "float above the toolbar" CSS recipe (`position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%);`) — no portal or extra z-index needed, since `.Toolbar` itself is already `position: absolute`. Unlike `DesignHint` it has no `autoHideAfterMs`; it hides purely by `isExporting` going back to `false`.

**PDF export (`Export/utils/pdf/`, hybrid layers).** `createExportFile` routes `ExportFormat.pdf` to `createPdfBlob(nodeId, rasterScale, ignoreOverlappingLayers, imageResampling, jpegQuality)` (raster scale = `max(rowScale, PDF_MIN_RASTER_SCALE = 2)`; the page itself is always 1px = 1pt at the node's rotated bounds, so the row's Scale doesn't resize the page; `jpegQuality` is the row's own Quality setting resolved to a number via `EXPORT_JPEG_QUALITY`). `isRasterExportFormat` became `isSupportedExportFormat` (png/jpeg/pdf/svg). Pipeline: `getExportRenderNodes` gives the paint-ordered node list; `getPdfLayers` walks it and classifies each node into one of three layer kinds, preserving paint order: a `text` layer (eligible straight text), a `vector` layer (eligible Rectangle/Frame/Ellipse/Polygon/Star) or a `raster` layer (every other node, consecutive ones merged into one layer). A raster layer is embedded via `embedPdfRasterLayer.ts`, which renders through the existing export renderer with the optional `includeNodeIds` filter (`renderNodeForExport(..., includeNodeIds)` → request field → `resolveExportRenderRequest` filters `nodesToDraw`).

- **Raster layer encoding (PNG vs. JPEG):** a raster layer is drawn as one image covering the *entire* page, opaque only where its own node subset has content — everywhere else is fully transparent, which is load-bearing whenever something else was already painted earlier in z-order (it must show through). So JPEG (no alpha) is only used when `layers.length === 1` and that one layer is the raster layer (`createPdfBlob.ts`'s `isSoleRasterLayer`) — i.e. nothing else exists on the page that a fully-opaque image could wrongly cover. In that one safe case, `embedPdfRasterLayer.ts` pre-flattens the rendered pixels onto opaque white (`flattenPixelsToOpaqueWhite.ts`, plain per-pixel alpha compositing) before JPEG-encoding at the row's `jpegQuality` — flattening to white first, rather than relying on the browser's own JPEG-encode alpha handling (which fills transparent pixels with black per the HTML spec, confirmed by testing), matches a blank PDF page's normal appearance for any leftover transparent margin (e.g. a rotated or non-rectangular top-level shape). Every other case (any vector/text layer present, or 2+ raster layers) stays lossless PNG, unaffected by the Quality setting.

- **Text layers** (`drawPdfTextNode`): `getStraightTextGlyphPlacements` (the same MSDF pen-walk the canvas and Flatten use) gives every glyph's `penX`/`baselineY`, each drawn as real text with the Inter TTF embedded via `@pdf-lib/fontkit` (`loadPdfFontBytes` fetches `Inter-Regular.ttf` once) — so the PDF matches the on-canvas layout exactly and stays selectable. `canExportTextAsRealText` requires: no `pathId`, no flips/rotation/stroke/non-normal own blend, every character present in the embedded font, and a safe ancestor chain — the node's own opacity is no longer required to be `1` (see the ancestor-blend/opacity bullet further down): `drawPdfTextNode` now composes its own and every ancestor's opacity together via `getEffectiveOpacity`, instead of reading only `node.opacity`.
- **Text-on-a-path layers, as vector curves** (`drawPdfTextCurves`/`canExportTextOnPathAsVectorCurves`, `PdfLayerType.textCurves`): a text node with `pathId` can never be real PDF text (PDF text always runs along a straight baseline), so instead of falling to raster it reuses the exact same "flatten to outline" machinery the canvas's own Flatten context-menu action uses — `getTextFlattenVector(MSDF_ATLAS_JSON, node, pathNode)` (from `utils/canvas/text/fontOutline/`, not PDF-specific at all) returns one merged `TVectorNode` with every glyph's real bezier outline already positioned/rotated along the path and merged with correct per-glyph hole detection (an "o"'s counter etc.), exactly like a hand-drawn pen-tool shape. `drawPdfTextCurves` just runs that result through `getRenderedVectorNode` (a no-op here since eligibility requires `rotation === 0`, but kept for consistency with `drawPdfVectorNodeShape`) and `drawPdfVectorFills` — **zero new PDF-specific geometry code**, only glue: resolve `nodesById[node.pathId]` and call the existing vector-fill pipeline.
  - **Eligibility** (`canExportTextOnPathAsVectorCurves`): requires `node.pathId` to resolve in `nodesById` (an unresolvable/missing path falls to raster, matching `getTextFlattenVector`'s own `null`-return contract for that case), `rotation === 0`/no flip (curved-glyph placement math isn't verified against a rotated/flipped text box — a deliberate, documented scope cut, not a fragile attempt), no stroke, non-empty content, normal blend (a text node's `blendMode` field has no effect on `mergeVectorNodeGeometries`'s synthetic solid-fill vector, so a blended node must be excluded or its blend mode would be silently dropped). Ancestor opacity is allowed (`isSafeAncestorChain(..., true, allowBlendMode)`) since a vector fill correctly threads `getEffectiveOpacity(node, nodesById)` through the existing `ca` ExtGState mechanism — `canExportTextAsRealText` composes ancestor opacity the same way now too (`drawPdfTextNode`/`drawSvgTextNode` both call `getEffectiveOpacity` instead of reading only `node.opacity`), so this is no longer a point of divergence between the two tiers; `allowBlendMode` itself is threaded in from each format's own caller (`false` for PDF, `true` for SVG — PDF has no isolated-group compositing to honor a blended ancestor with, so it must keep rejecting one).
  - **Routing** (`getPdfLayers`/`createPdfBlob`): a text node now tries real text first, then vector curves, then raster (`addTextLayer` helper inside `getPdfLayers.ts`); `createPdfBlob`'s per-layer loop became a `switch (layer.type)` once a fourth layer kind existed, matching this repo's switch-over-`if` convention.
  - **Verified with a real generated PDF, not just unit tests** (macOS Quick Look/PDFKit, using the real Inter font via a stubbed `fetch` — same technique as `getTextFlattenVector`'s own determinism tests — with `utils/canvas/vectorNetwork/getVectorFillLoopPoints` left unmocked so real glyph geometry reached the page): a long sentence set on an elliptical path rendered as legible, correctly-curved, correctly-rotated red glyph outlines following the ellipse all the way around — confirming the reused Flatten pipeline's output drops straight into the PDF vector-fill pipeline with no coordinate-space mismatch.
- **Vector layers** (`drawPdfShape`, `switch (node.type)` dispatching to `drawPdfBoxShape`/`drawPdfLineShape`/`drawPdfVectorNodeShape`/`drawPdfSimpleShape`): eligibility (`canExportShapeAsVector`) dispatches the same way, to `canExportBoxShapeAsVector`/`canExportLineAsVector`/`canExportVectorNodeAsVector`/`canExportSimpleShapeAsVector`. `isPlainSolidPaint` (visible-and-solid-with-normal-blend) and `drawPdfPaintPolygons` (walks a `TPaint[]` in paint order via `getFillsInPaintOrder`/`getScaledFillPaints`, drawing one even-odd path per visible solid paint) are shared by every paint-array-based shape kind below, not just re-typed per file.
  - **Frame/Rectangle** (`drawPdfBoxShape`/`canExportBoxShapeAsVector`): reuses the renderer's own geometry — `getBoxFillPolygon` for the fill and `getBoxStrokeRingPolygons` for the stroke (every stroke mode/dash/per-side width already comes out as ring polygons). Eligibility: only visible solid paints with normal blend, no visible effects, no legacy `strokeColor`, stroke mode basic (brush/dynamic stay raster), safe ancestors. Curves are the renderer's polylines (`ROUNDED_RECT_CORNER_SEGMENTS = 8` per corner).
  - **Ellipse/Polygon/Star** (`drawPdfSimpleShape`/`canExportSimpleShapeAsVector`): these three node types have no `fills`/`strokes` paint array (just a single legacy `fill: string` hex color, and — ellipse only — `strokeColor`/`strokeWidth`/`strokeAlign`; polygon/star have no stroke fields at all in the type, matching that the canvas itself never paints a polygon/star stroke, only a UI hover/mask outline uses `drawThickPolygonOutline`/`drawThickStarOutline`), so eligibility is just "not hidden, normal blend, safe ancestors" — no paint-array checks needed. Ellipse fill reuses `getEllipsePoints`/`getEllipseArcPoints` (full ellipse, pie wedge, or donut ring depending on `arcStartAngle`/`arcEndAngle`/`arcRatio`, mirroring `drawEllipseArc`'s own branch) and its stroke ring always uses the full-ellipse outline via `getStrokeAlignInset` (matching `drawThickEllipseOutline`, which ignores any arc). Polygon/star fill reuses `getPolygonPoints`/`getStarPoints` (or the rounded variants when `cornerRadius > 0`, faceted via `ROUNDED_POLYGON_CORNER_SEGMENTS`/`ROUNDED_STAR_CORNER_SEGMENTS`), with `flipPoint` then `rotatePoint` applied per point to match the canvas exactly.
  - **Line** (`drawPdfLineShape`/`canExportLineAsVector`): `TLineNode` is a zero-height box (`getLinePoints` gives its endpoints), so eligibility is "not hidden, safe ancestor chain, and at most one visible stroke that is solid" (`canExportLineStroke`; a gradient or several strokes fall back to raster). The shape is the line's one outline polygon (`getLineStrokePolygon`: the body plus both endpoint shapes from `getLineEndOutlinePoints/`), the same one the canvas fills, drawn in that solid stroke's color and opacity. `NodeType.path` (the hidden ellipse-shaped guide a `TTextNode.pathId` follows for text-on-a-path — confirmed by `drawPathOutline` only ever drawing it in editing/hover/selected states, never in a normal/export render) is *not* the same thing as this "Line" — it already renders as nothing during export, correctly, with no PDF-specific work needed.
  - **Pen-tool vector shape** (`NodeType.vector`, `drawPdfVectorNodeShape`/`canExportVectorNodeAsVector`): `TVectorNode` is the general bezier network (`vertices`/`segments` with optional tangents, `filledFaceKeys`/`fillByKey`/`holeParentByKey` for per-face fills and holes, `widthProfile` for a variable-width stroke) — also not a `TBoxSceneNode` (no `opacity`/`blendMode`, but it does have its own `rotation`, baked into fresh vertex/segment/tangent positions by `getRenderedVectorNode` around the shape's own bounding-box center before any geometry is read, exactly like the canvas does; eligibility itself still calls `getRotatedNodeBounds(node)` on the *raw*, un-baked node, matching every other shape kind's ancestor/clip check). Three concerns, one orchestrator (`drawPdfVectorNodeShape`) sequencing three sibling files:
    - **Fills** (`drawPdfVectorFills`): `groupFilledFacesForRendering(renderedNode)` — the exact function the canvas itself calls — already returns each fill group as `{paint: TPaint[], polygons: TPoint[][]}` with bezier curves flattened and same-color holes merged into their parent's polygon list; each group is just handed straight to `drawPdfPaintPolygons`. Eligibility requires every group's `paint` array to pass `isPlainPaint` (below) — only an image/pattern/video paint makes the whole node raster now; any gradient type at any stop opacity (including translucent) exports as a real vector shading.
    - **Stroke** (`drawPdfVectorStroke`, only when `strokeWidth > 0 && strokeColor` and no `widthProfile` — a variable-width stroke keeps the whole node raster, not just the stroke): the canvas's own `getVectorNodeThickStrokeVertices(renderedNode, strokeWidth / 2)` already produces a flat `number[]` of `GL_TRIANGLES` (clusters/branches/miter-vs-bevel joins per `getPolylineJoinVertices`'s `MITER_LIMIT = 4`, all already solved) — `getStrokeTrianglePolygons` just reshapes every 6 numbers into a 3-point polygon, with **zero** new geometry math. Filled with the **non-zero** rule (`drawPdfPolygons`'s new optional `fillRule: 'evenOdd' | 'nonZero'` parameter, default unchanged), not even-odd — adjacent stroke triangles legitimately overlap at concave corners (the canvas just alpha-blends them, opaque-on-opaque), and even-odd would punch a hole exactly there.
    - **Round caps** (`drawPdfVectorRoundedCaps`, only when `capStyle === 'round'`): a small filled circle (`getEllipsePoints`, fixed `PENCIL_CAP_RADIUS_PX` radius) at each open-path endpoint (`getOpenVectorEndpoints`), matching `drawVectorRoundedCaps` — drawn regardless of whether the stroke itself is visible, same as the canvas.
- **Shared ancestor rule** (`isSafeAncestorChain`): no hidden/mask/rotated/non-normal-blend ancestors and, for a clipping frame, the node's rotated bounds must lie inside it; text additionally rejects translucent ancestors (shapes multiply the inherited opacity in instead).
- **Gradient fills as real PDF shadings** (`drawPdfGradientPolygons`, reached from `drawPdfPaintPolygons` whenever a paint's `type` isn't `'solid'`): `isPlainPaint.ts` (renamed from `isPlainSolidPaint`, since it now gates every shape kind's whole eligibility list — Frame/Rectangle fills+strokes, pen-tool vector face fills — not just solid color) allows `'solid'` and all four gradient types, regardless of stop opacity; `isOpaqueGradientPaint.ts` no longer gates eligibility (moved from the `canExport*` files to `drawPdfGradientPolygons` itself), where it decides whether a soft mask needs to be attached (see below) — the paint's own overall opacity still applies through the existing `ca` ExtGState mechanism unchanged either way.
  - **Geometry** (`getPdfGradientGeometry(paint, fillBounds, pageBounds)`): `paint.start`/`paint.end` are **not** absolute points — they're `0..1` fractions of the filled shape's own bounding box, the same contract the canvas's gradient fragment shader and the on-canvas gradient-handle code (`getGradientWorldPoints.ts`) both use. A real, reported bug (a rectangle far from the page origin exported as one flat color, no gradient at all) traced back to this exact assumption being wrong here: `getPdfGradientGeometry` was calling `toPdfPagePoint(paint.start, bounds)` directly, treating the normalized fraction as if it were already an absolute point. For a shape whose bounds sit far from `(0,0)`, that collapsed the two-point gradient axis to a near-zero-length segment thousands of units off the page — `Extend: [true, true]` then clamped every on-page pixel to one flat endpoint color. Fixed: `getPdfGradientGeometry` now takes **two** separate rects — `fillBounds` (the shape's own bounding box, used to convert the normalized `paint.start`/`paint.end` into an absolute world point: `fillBounds.x + normalized.x * fillBounds.width`, etc. — mirrors `getGradientWorldPoints.ts`'s `toWorldPoint`) and `pageBounds` (the export page, used only for the existing `toPdfPagePoint` flip, unchanged). No extra rotation step is needed on top of that: `fillBounds` itself is always the bounding box of the *already-rotated* fill geometry (see below), matching the gradient shader's own behavior of never applying a separate rotation correction for gradients.
    - **What `fillBounds` is, per shape kind** (must match the canvas's own choice of "bounds" exactly, since that choice changes where the axis actually lands): reused verbatim from `utils/canvas/drawVectorNode/getVectorFillBounds.ts` (`getVectorFillBounds(polygons, nodeBounds)` — the exact function the canvas's own `drawVectorGradientFill` calls). For **Frame/Rectangle**, `nodeBounds` is `null` (mirrors `drawBoxPaints.ts` passing `null`), so `fillBounds` auto-computes as the AABB of `getBoxFillPolygon(node)` — a polygon that already has the node's own rotation baked in via `rotatePoint`, so for a rotated rectangle `fillBounds` is the AABB of the *rotated* shape, not `{node.x, node.y, node.width, node.height}`. Confirmed by real rendering with a 25°-rotated rectangle: the gradient axis stays screen-horizontal rather than rotating with the shape — surprising at first, but this is exactly what the canvas itself already does (no `u_rotation`/`u_rotationCenter` uniform is ever set for the gradient shader program, confirmed by grep — only the pattern/image fill shaders receive a rotation correction), so PDF export deliberately reproduces it rather than "fixing" a divergence from canvas. For **pen-tool vector shapes**, `nodeBounds` is `getVectorNodeBounds(renderedNode)` (mirrors `drawVectorNode.ts` exactly) — the AABB of the already-rotation-baked node's vertices *and* bezier handle points, not just the flattened fill polygons.
    - `direction`/`perpendicular`/`primaryRadius` are still derived directly in page space (not by transforming design-space vectors) since the radial/diamond/angular formulas are all symmetric under `perpendicular → -perpendicular`, so the Y-flip's effect on rotational handedness never matters.
    - **Verified with real generated PDFs** (macOS Quick Look/PDFKit): the exact reported-bug scenario (default gray-to-gray stops, shape offset from the page origin) now shows a proper left-to-right gradient instead of flat gray; a 25°-rotated rectangle's gradient axis matches the canvas's own (screen-horizontal, non-rotating) behavior described above.
    - **Process note**: every gradient test/verification earlier in this session (unit fixtures and ad-hoc `qlmanage` scripts alike) happened to place the filled shape at `x: 0, y: 0`, which coincidentally made the broken "treat as absolute" code produce a correct-looking result and masked the bug completely — worth remembering when writing verification fixtures for anything involving a shape's own bounding box.
  - **Color function** (`getPdfGradientStitchingFunction`, reused for the RGB case by `getPdfGradientColorFunction`): mirrors `vectorGradientFillFragmentShaderSource`'s own `sampleGradient` exactly — a Type 3 (stitching) function combining one Type 2 (exponential interpolation, `N: 1`, linear) sub-function per pair of consecutive stops, plus a synthetic constant (`C0 === C1`) leading segment when the first stop's position is `> 0` and a trailing one when the last is `< 1`, so `Domain: [0, 1]` is always fully covered without needing `Extend` tricks inside the function itself (`Extend` on the *shading* still governs before-t=0/after-t=1). Collapses to a single Type 2 function directly (no Type 3 wrapper) when there are exactly two stops spanning the full `[0, 1]` domain. **Only linear/radial use this** — angular/diamond need their own inline PostScript version of the same stop-lookup logic (below), since a Type 4 function can't call other PDF function objects.
  - **Linear** (`getPdfAxialShadingPattern`, PDF `ShadingType 2`): `Coords` are the page-space start/end points directly, `Matrix` stays identity — no transform trickery needed for an axial shading.
  - **Radial** (`getPdfRadialShadingPattern`, PDF `ShadingType 3`): the canvas's own radial gradient is elliptical (`radiusRatio` scales the secondary axis) and can be arbitrarily rotated, but PDF's radial shading only draws circles. Standard trick: the *shading* itself is always two concentric unit circles at the origin (`Coords: [0,0,0, 0,0,1]`), and the surrounding *Pattern*'s `Matrix` (`[direction*primaryRadius, perpendicular*primaryRadius*radiusRatio, startPage]`, i.e. an affine map from unit-circle space to page space) does the actual scale+rotate+translate into an ellipse — the same "unit circle warped by a matrix" technique used everywhere ellipses are built from circles.
  - **Angular/diamond** (`getPdfFunctionBasedShadingPattern`, PDF `ShadingType 1` — function-based shading, since PDF has no native conic/Manhattan shading type): the shading's `Domain` is set to the page's own bounds so the Type 4 function receives page-space `(x, y)` directly (`Matrix` stays identity, same reasoning as linear). A hand-written PostScript calculator program (stream content of a `FunctionType: 4` object, built by `getPdfGradientGeometryProgram` + `getPdfGradientColorLookupProgram`) does everything per-pixel:
    - `getPdfGradientGeometryProgram`: computes `t` from `(x, y)`. Since `direction`/`perpendicular`/`primaryRadius`/`startPage` are all *constants* known at export time (not per-pixel), the dot products collapse to plain linear expressions of `x, y` with precomputed coefficients (`a = x·aCoefX + y·aCoefY + aConst`, same for `b`) — no runtime `sqrt`/normalize needed inside PostScript at all. Angular uses `atan(b, a)` (PostScript's `atan` already returns degrees in `[0, 360)`, exactly matching the canvas shader's own `atan2` + "add 360 if negative" normalization for free) then `360 div`; diamond uses `abs(a) + abs(b)` (both pre-divided by `primaryRadius`, matching the shader's `t = abs(a)+abs(b)` branch). The stack choreography needed to compute two independent linear combinations of the same `(x, y)` input without pdf-lib-side execution (`2 copy`, then `3 1 roll` to un-bury the second `(x, y)` pair after consuming the first into `b`) only leaves two numbers on the stack at any point — no `index`/deep stack juggling. **Always clamps `t` to `[0, 1]`** afterward (`dup 0 lt {pop 0} if dup 1 gt {pop 1} if`) — diamond's Manhattan metric routinely exceeds 1 near a bounding box's corners (confirmed by an actual visual bug caught during verification: unclamped diamond corners extrapolated past the last stop's color into solid black instead of staying flat).
    - `getPdfGradientColorLookupProgram`: the same stops-to-segments logic as the Type 2/3 function builder (leading/trailing constant segments, one segment per stop pair), but inlined as inline PostScript instead of separate PDF function objects: a nested `dup <bound> le {…}{…} ifelse` chain per segment boundary, and each segment computes `R, G, B` from `t` via precomputed per-channel slope/intercept (`dup <slope> mul <intercept> add`, chained with `exch`/`dup` so the final stack is exactly `[R, G, B]` — verified this exact `dup`/`exch` sequence by hand-tracing the stack, then confirming with real rendered output).
    - Every number is generated by `formatPostScriptNumber` (rounds to 6 decimals, degenerate `NaN`/`Infinity` become `'0'` — guards the zero-span case when two stops share a position).
  - **Pattern registration** (`registerPdfPattern`/`registerPdfPatternInDict`): pdf-lib has no first-class Pattern-resource API (only `Font`/`XObject`/`ExtGState` get one via `PDFPageLeaf`), so this reaches into a `/Resources` dict directly (`registerPdfPatternInDict(resources, patternDict)`: `resources.lookupMaybe(PDFName.of('Pattern'), PDFDict)`, creating and `.set`-ting it the first time) and uses the same `PDFDict.uniqueKey()` pdf-lib itself uses internally for Font/XObject/ExtGState keys. `registerPdfPattern(page, patternDict)` is the page-resources wrapper (`page.node.normalizedEntries()` to guarantee `Resources` exists, then delegates); the underlying `registerPdfPatternInDict` is reused as-is for the soft-mask Form XObject's own private `/Resources` (below), since a pattern can live in any resources dict, not just a page's.
  - **Translucent stops — soft mask** (`getPdfGradientSoftMaskState`, attached by `drawPdfGradientPolygons` whenever `!isOpaqueGradientPaint(paint)`): PDF shadings have no per-stop alpha channel, so translucency is layered on top via a standard **luminosity soft mask** instead of falling back to raster. The mechanism, mirroring the RGB color pattern almost exactly but in gray:
    - **Alpha function** (`getPdfGradientAlphaFunction`/`getPdfGradientAlphaLookupProgram`): the exact same stitching-function/PostScript-segment machinery as the RGB color function (`getPdfGradientStitchingFunction`'s `getValues` callback swapped for `(stop) => [stop.opacity / 100]`, one channel instead of three), producing a `[0, 1]` gray value instead of `[r, g, b]`. Angular/diamond reuse the identical `getPdfGradientGeometryProgram` output verbatim (geometry is opacity-independent) and only swap in the single-channel PostScript lookup — same "can't call other PDF functions from a Type 4 stream" constraint as the RGB case, same deliberate duplication.
    - **Gray shading pattern** (`getPdfAxialAlphaShadingPattern`/`getPdfRadialAlphaShadingPattern`/`getPdfFunctionBasedAlphaShadingPattern`, dispatched by `getPdfGradientAlphaPatternDict`): byte-for-byte the same `Coords`/`Matrix`/`Domain` geometry as the RGB pattern builders (same `TPdfGradientGeometry`), just `ColorSpace: 'DeviceGray'` and the alpha function instead of the color one — geometry is fully shared, only color space and function differ.
    - **Mask group** (a `/Type /XObject /Subtype /Form` with `/Group << /S /Transparency /CS /DeviceGray >>`, built via pdf-lib's `context.formXObject(operators, dict)` — the first-class helper for exactly this, so no hand-serialized content-stream text is needed): its content stream fills the *same* polygon path as the visible fill (`getPdfPolygonPathOperators(polygons, bounds)`, identical to the main draw call) with the gray pattern (`/Pattern cs` + `/<name> scn`) instead of a color. Painting only within the shape's own path — not the full page `BBox` — is deliberate: a luminosity mask's unpainted area defaults to black backdrop (alpha 0), which is exactly correct here since the main content is never painted outside that same path either.
    - **ExtGState** (`{ SMask: { G: <form ref>, S: 'Luminosity', Type: 'Mask' }, Type: 'ExtGState' }`, registered via `page.node.newExtGState` — pdf-lib's own key-generation + resource-set combo, unlike Pattern which has no such helper): applied with a *second* `gs` operator inside the same `q`/`Q` scope as the existing opacity `gs` (`getPdfGraphicsState`) — two separate `gs` calls merge independent dict keys (`ca`/`CA` from the first, `SMask` from the second) into one graphics state, so the paint's own overall opacity and the per-stop soft mask combine correctly without either clobbering the other.
    - **Eligibility**: `isOpaqueGradientPaint` was removed entirely from `canExportBoxShapeAsVector`/`canExportVectorNodeAsVector` (translucent gradients are no longer raster-only) — it now only decides, at draw time inside `drawPdfGradientPolygons`, whether the extra soft-mask machinery above is needed at all; a fully-opaque gradient skips it and draws exactly as before.
  - **Painting** (`drawPdfGradientPolygons`): identical `q`/opacity-`gs`/path/`Q` wrapper as a solid fill, except the fill color step becomes `/Pattern cs` + `/<name> scn` (a *colored* shading pattern takes only its resource name as the `scn` operand — no color components) instead of `setFillingRgbColor` — raw operators throughout, mirroring `drawPdfPolygons`'s own style (`PDFOperatorNames.NonStrokingColorspace`/`NonStrokingColorN`, no dedicated pdf-lib helper exists for either). Dispatches on `paint.type` (`switch`) to the axial/radial/function-based pattern builder, and inserts the soft-mask `gs` (above) right after the opacity `gs` when the paint has any translucent stop.
  - **Verified with real generated PDFs, not just unit tests** (macOS Quick Look/PDFKit): a red→blue linear gradient; a 30°-rotated, `radiusRatio: 0.4` yellow→green radial gradient (correctly elliptical and rotated); a 4-stop angular gradient (clean conic sweep, correct seam); a 15°-rotated, `radiusRatio: 0.6` yellow→green diamond gradient (correct diamond shape, flat beyond the last stop after the clamp fix); an opaque-red-to-transparent-blue linear gradient and an opaque-to-transparent green diamond gradient, both painted over striped background rectangles — confirmed the striping correctly bleeds through as each gradient fades to transparent, proving the luminosity soft mask (not just the shading itself) renders correctly end to end. **Caveat, since corrected**: every one of these runs placed the filled shape at `x: 0, y: 0`, which (see the "Geometry" section above) coincidentally masked the normalized-vs-absolute `paint.start`/`paint.end` bug for months of this feature's development — the shape-position/rotation coverage itself (elliptical, angular seam, diamond clamp, soft-mask alpha) is still valid, but re-verify any *new* gradient geometry work on a shape away from the origin, not at it.

Only Inter exists today; when the backend serves other fonts, `loadPdfFontBytes` is the single place to turn into a per-family/weight lookup (text with an unavailable font should then fall back to raster/curves, not be substituted). Not done yet: shadow-under-text (Figma draws it as an image below selectable text) is naturally what the layer split already yields once text nodes carry effects.

**Font embedding must use `subset: false`.** `pdfDocument.embedFont(bytes, { subset: true })` corrupts the embedded `glyf` table for Inter-Regular.ttf in this version of `@pdf-lib/fontkit` — every real-text glyph comes out empty/invisible in a spec-compliant reader (confirmed with `fontTools` failing to decode the subsetted `glyf` entries, and with a real render via macOS Quick Look/PDFKit showing a blank page). Reproduces with the simplest possible case (one `embedFont(..., {subset:true})` + one `drawText` call), so it isn't caused by this codebase's per-glyph draw loop — it's an upstream subsetting bug in the pinned `@pdf-lib`/`@pdf-lib/fontkit` versions. `createPdfBlob.ts` embeds the full font instead (~180KB compressed, fixed per export regardless of text amount) to get correct, visible text. If `@pdf-lib`/`@pdf-lib/fontkit` are ever upgraded, re-test `subset: true` before reverting this.

**Known inefficiency, not yet fixed:** `drawPdfTextNode` calls `page.drawText(char, {font, opacity, ...})` once per glyph. Each call re-registers the font (`page.node.newFontDictionary`) and the opacity `ExtGState` (`page.maybeEmbedGraphicsState`) under a brand-new resource name every time — even though the JS `PDFFont, opacity` are unchanged between calls — so a page's `/Resources` dictionary grows by two entries per glyph instead of reusing one. Harmless for short strings, but wasteful for long text. A fix would draw text via raw operators (`beginText`/`setFontAndSize`/`setTextMatrix`/`showText`/`endText` through `page.pushOperators`, mirroring `drawPdfPolygons`) with the font registered once and opacity reusing the same cached `graphicsStates` map already threaded through the vector-shape drawing.

**SVG export (`Export/utils/svg/`, hybrid layers).** Mirrors the PDF pipeline's shape (`createExportFile` routes `ExportFormat.svg` to `createSvgBlob(nodeId, rasterScale, ignoreOverlappingLayers, imageResampling, jpegQuality)`, same `EXPORT_MIN_VECTOR_RASTER_SCALE = 2` floor on the raster scale — renamed from PDF's own `PDF_MIN_RASTER_SCALE` once a second consumer needed it — and the same `isSoleRasterLayer` → opaque-white-flattened-JPEG special case), but the output itself is plain text (one `<svg>` string built by string concatenation into an `elements: string[]` accumulator, no library) and needs none of PDF's page-space machinery: SVG's own coordinate system is already Y-down/top-left, exactly matching canvas and the design-node coordinate space, so there is no `toPdfPagePoint`-style Y-flip anywhere in this module — `getSvgPolygonPathData` only translates by `bounds.x`/`bounds.y`.

- **Scope cut, deliberate**: only Frame/Rectangle/Ellipse/Polygon/Star/Line with **solid or any gradient type** fills/strokes (`isSvgVectorPaint.ts`, renamed from an earlier `isSolidPaint.ts` once gradients joined — a sibling of PDF's `isPlainPaint.ts`, `SUPPORTED_PAINT_TYPES` is `['solid', 'gradient-linear', 'gradient-radial', 'gradient-angular', 'gradient-diamond']`) export as vector `<path>`s. Ellipse/Polygon/Star/Line never gained gradient support since their own data model only ever had a single flat `fill: string`/`stroke: string` hex color to begin with (same constraint PDF's `drawPdfSimpleShape`/`drawPdfLineShape` already documented) — gradients only ever apply to Frame/Rectangle's `fills`/`strokes: TPaint[]`.
- **Pipeline** (`getSvgLayers`/`canExportShapeAsSvgVector`/`drawSvgShape`/`embedSvgRasterLayer`): byte-for-byte the same shape as `getPdfLayers`/`canExportShapeAsVector`/`drawPdfShape`/`embedPdfRasterLayer`, including the same three-tier `SvgLayerType.text`/`textCurves`/`vector` routing for text nodes (see the text bullet below) — `getSvgLayers` takes the same `(nodes, canExportAsRealText, canExportAsVector, canExportAsTextCurves)` parameter order as `getPdfLayers`.
- **Rotated ancestors: allowed, via nested `<g transform>` groups.** `isSafeAncestorChain` (shared with PDF) no longer requires `ancestor.rotation === 0` — only `hidden`/`mask`/non-normal-blend-when-disallowed/translucent-when-disallowed ancestors still block eligibility; `isInsideClip`'s containment test for a `clipContent` ancestor now inverse-rotates the child's bounds by `-ancestor.rotation` around the ancestor's own center before checking containment against its unrotated local rect, so a rotated clipping frame is handled exactly, not just an unrotated one. This is a correction of an earlier design note in this file that assumed nested `<g>` groups were needed to *compose* rotation at all — they aren't: every node's `x`/`y`/`rotation` are already fully composed absolute values (confirmed by tracing `rotateShapeNodeOrigin`/`getRotatedNodeChanges` — rotating a Frame rewrites `x`/`y`/`rotation` on every descendant recursively, baking the parent's contribution in), and the WebGL renderer itself never composes ancestor transforms either, so a flat leaf drawn with its own absolute fields already renders correctly with no wrapping at all.
  - **Why nested groups are still built, then**: purely so the *emitted markup* mirrors the real node hierarchy (a rotated Frame's children live inside a real `<g>`, not as more flattened absolute paths) — a structural/readability goal, not a correctness requirement. `getSvgAncestorLocalTransform(node, nodesById)` recursively decomposes a node's absolute center/rotation into a value relative to its immediate parent's own already-decomposed local frame: `localRotation = node.rotation - parent.rotation` (angles simply subtract, since 2D rotations commute) and `localCenter = parent.localCenter + R(-parent.rotation)·(node.absoluteCenter - parent.absoluteCenter)` (computed via the existing `rotatePoint` convention, not hand-rolled trig). `getSvgLocalizedNode` builds a shallow clone of the leaf with `x`/`y`/`rotation` overridden to its own decomposed local values (every other field, including `id`/`parentId`, untouched) and hands that clone to the *unmodified* existing drawers (`drawSvgBoxShape`/`drawSvgTextNode`/etc.) — no per-drawer changes were needed, since every drawer already consumed `node.x/y/rotation` directly.
  - **Only box-model node types get the rotation transform** (`isSvgBoxModelShapeNode`: Frame/Rectangle/Ellipse/Polygon/Star/Media, plus `TTextNode` for the real-text tier) — these are the types whose rotation stays additively composable in a dedicated `rotation` field forever (confirmed via `getRotateNodeOrigins`'s uniform `default` case). **Line and pen-tool Vector nodes are deliberately excluded from the transform and always draw flat**: tracing `getRotatedNodeChanges` shows that whenever an ancestor-driven rotation touches a Vector node, its rotation gets *baked directly into its vertex coordinates* (`bakeVectorNodeRotation` + `rotateVectorNodeOrigin`, resetting `rotation` to `0`) rather than staying in a composable field — Lines work the same way via `rotateLineNodeOrigin`, always rewriting `x1/y1/x2/y2` directly. Wrapping either in a rotated `<g>` would double-apply rotation that's already baked into their own absolute coordinates. The same reasoning excludes text-on-a-path curves (`SvgLayerType.textCurves`) from the transform — `getTextFlattenVector` already flattens to absolute curve points, same as a Vector node. (These baked-geometry types can still get a `<g>` for blend mode, see below — the transform and the style attribute are independently gated.)
  - **Real text needed one more fix**: `getStraightTextGlyphPlacements` (shared with PDF) never applied `node.rotation` to glyph placement at all — previously safe, since real-text eligibility required the node's own *absolute* rotation to be exactly `0`. Once an ancestor can be rotated, a text node's own absolute rotation can still be `0` while its *local* (decomposed) rotation is nonzero (the counter-rotation that cancels the ancestor's contribution back out) — `drawSvgTextNode` now applies that local rotation as a `transform="rotate(...)"` on the whole `<text>` element (reusing `getSvgRotateTransformValue`, the same helper `drawSvgMediaNodeShape` already used), rather than trying to rotate each glyph's pen position individually.
  - **Orchestration lives entirely in `createSvgBlob`**, not `getSvgLayers` (still a flat list, unchanged): a `TSvgAncestorGroup[]` stack (`updateSvgAncestorGroupStack`) is diffed against each successive layer's own required groups (`getSvgLayerAncestorGroups`, which now dispatches to `getSvgAncestorGroups` per layer type — see below) — common-prefix entries stay open, the rest close/(re)open — since `getExportRenderNodes` is a pre-order DFS walk of the real tree, siblings under the same ancestor are always contiguous, so this stack-based diff alone (no explicit tree structure) correctly reconstructs proper nesting.
- **Blended and translucent ancestors: also allowed, on top of rotation.** `isSafeAncestorChain` grew a 5th parameter, `allowBlendMode` — every SVG eligibility call site passes `true`, every PDF call site still passes `false`, since PDF has no way to express a blend mode at all (no transparency-group machinery anywhere in `utils/pdf/`) and sharing the relaxation would have silently dropped the ancestor's blend compositing from PDF output. `canExportTextOnPathAsVectorCurves` (shared verbatim between both formats) had to grow the same parameter threaded in from each format's own caller, for the same reason. Real text's `allowOpacity` also flipped from `false` to `true` for both formats (a plain bug-fix-sized change, not part of the blend-mode work) — `drawSvgTextNode`/`drawPdfTextNode` now call the same `getEffectiveOpacity(node, nodesById)` every other drawer already used, instead of only reading `node.opacity`, so a translucent ancestor composes into the text's opacity instead of blocking it outright; this also let the node's own `opacity === 1` requirement in `isOwnStyleSupported` (PDF and SVG both) be deleted, since `getEffectiveOpacity` already folds the node's own opacity into the same multiplication.
  - **Why blend mode needed real research first**: confirmed via `renderIsolatedBlendNode.ts`/`paintIsolatedContent.ts`/`compositeBlend.ts` that the canvas renderer already treats a blended ancestor's *entire subtree* as one offscreen-rendered unit, composited once against its backdrop through a blend-mode fragment shader — i.e. real isolated-group compositing, not per-leaf blending. That's exactly what CSS `mix-blend-mode` + `isolation: isolate` on a wrapping `<g>` gives for free, which is what makes wrapping the ancestor's exported subtree in one blended, isolated `<g>` a faithful match rather than an approximation.
  - **`getSvgCssBlendMode(blendMode)`** translates the app's `BlendMode` enum (`types/design/enums.ts`, mostly camelCase) to CSS `mix-blend-mode` keywords (kebab-case: `colorDodge`→`color-dodge`, `hardLight`→`hard-light`, etc.), returning `null` for `normal`/`passThrough`/undefined (no wrapping needed — matches the canvas's own `hasRealBlendMode`, which treats `passThrough` as a no-op too) and also `null` for `plusDarker`/`plusLighter` (Figma-style additive/subtractive blends with no reliable cross-browser CSS equivalent). Ancestors with those last two still hard-block eligibility exactly like before (`isBlendSupported` in `isSafeAncestorChain.ts`, checked only when `allowBlendMode` is true; `allowBlendMode: false` still uses the old `isBlendNormal`, rejecting anything non-`normal`).
  - **`getSvgAncestorGroups`** (renamed from `getSvgRotatedAncestorGroups` once it grew a second concern) combines the rotation transform and the blend style into *one* `<g>` per ancestor rather than two independently-nested groups — deliberately, not for markup terseness: two independent open/close stacks (one for rotation-eligible layers, one for every layer including baked-geometry ones) would need strict LIFO interleaving across a single `elements` array, and a layer-type transition under the *same* ancestor (a box-model sibling followed by a Line sibling, say) would need the rotation attribute present on one and absent on the other for that identical ancestor — two different requirements for "the same open tag" that a simple stack can't express safely. Combining both concerns into one function sidesteps this: each ancestor contributes at most one `<g style="..." transform="...">` (whichever attributes apply, `allowsRotationTransform` gating only the transform half — blend applies unconditionally to every layer type except raster), and the stack dedup key became `` `${ancestor.id}|${markup}` `` (not just `ancestor.id`) so that (a) two *different* ancestors that coincidentally produce identical markup never get merged into one open group across a subtree boundary, and (b) the *same* ancestor producing different markup for two adjacent layer types (rotation included vs. omitted) correctly closes and reopens instead of reusing a wrapper with the wrong attributes.
  - **Raster layers never participate**, for either rotation or blend — confirmed the raster snapshot (`renderNodeForExport`) already captures final, fully-composited pixels straight off the real canvas, so rotation and blend mode are already baked into that image; wrapping it in either kind of `<g>` would be redundant at best and double-apply the effect at worst.
- **Per-shape drawers** (`drawSvgBoxShape`/`drawSvgEllipseShape`/`drawSvgPolygonShape`/`drawSvgStarShape`/`drawSvgLineShape`) reuse the *exact* geometry PDF's drawers use — `getBoxFillPolygon`/`getBoxStrokeRingPolygons` (already canvas-shared), plus four functions promoted out of `pdf/` into the global `utils/canvas/shapes/` once SVG needed them too (`getPolygonShapePoints`, `getStarShapePoints`, `getLineQuadPoints`, `getArrowheadPolygons`), plus two new promotions split out of `drawPdfEllipseShape.ts`'s own previously-private helpers (`getEllipseFillPoints`, `getEllipseStrokeRingPoints`) so both formats call the identical function instead of maintaining two copies of the same arc/donut/stroke-ring math. `drawPdfEllipseShape.ts`/`drawPdfPolygonShape.ts`/`drawPdfStarShape.ts`/`drawPdfLineShape.ts` were updated to import from the new shared locations, unit-tested behavior unchanged (verified via the existing PDF spec suite, still 100% green after the move).
- **Painting** (`drawSvgPolygons`/`getSvgPolygonPathData`): one `<path d="M… L… … Z" fill="#hex-or-url" fill-opacity="0.5" fill-rule="evenodd"/>` per polygon group — `fill-opacity` is only emitted when `< 1` (keeps the common case's markup shorter), `formatSvgNumber` (a plain duplicate of PDF's `formatPostScriptNumber` — round to 6 decimals, non-finite → `'0'` — kept as its own copy rather than forcing a cross-format rename of the PDF-named original for one trivial one-liner) formats every coordinate. `drawSvgPolygons`'s `color` argument is just dropped straight into `fill="..."` with no validation that it's a hex color, which is what lets a gradient reuse it unchanged by passing `url(#<id>)` instead (see below) — no separate "gradient painting" primitive was needed. `drawSvgPaintPolygons` walks a `TPaint[]` in paint order (`getFillsInPaintOrder`/`getScaledFillPaints`, both already canvas-shared) exactly like `drawPdfPaintPolygons`, filtered to visible solid-or-gradient paints, dispatching solid straight to `drawSvgPolygons` and everything else to `drawSvgGradientPolygons` (mirrors `drawPdfPaintPolygons`'s own `if (paint.type === 'solid')` branch byte-for-byte).
- **Gradient fills as real `<linearGradient>`/`<radialGradient>` defs** (`drawSvgGradientPolygons`, `getSvgGradientGeometry`, `getSvgLinearGradientDef`/`getSvgRadialGradientDef`, `registerSvgGradientDef`): reuses the *exact* geometry math PDF's `getPdfGradientGeometry`/`getPdfRadialShadingPattern` use — `paint.start`/`paint.end` are still `0..1` fractions of the filled shape's own bounding box (`getVectorFillBounds(polygons, nodeBounds)`, `nodeBounds` stays `null` for Frame/Rectangle so it auto-computes as the AABB of the already-rotated fill polygon, identical to PDF), and the radial gradient still warps a unit circle (`cx="0" cy="0" r="1"`) into the shape's actual ellipse via a `gradientTransform="matrix(a b c d e f)"` built from the same `[direction*primaryRadius, perpendicular*primaryRadius*radiusRatio, start]` values as PDF's Pattern `Matrix` — SVG's `matrix(a,b,c,d,e,f)` and PDF's `Matrix` array use the *identical* 2D affine convention (`x' = a·x + c·y + e`), so the numbers carry over unchanged, just serialized differently. The one real difference from PDF's geometry: `getSvgGradientGeometry` calls a plain `toSvgPagePoint` (translate-only) instead of `toPdfPagePoint` (translate + y-flip) — `getSvgPolygonPathData`'s own inline point-to-string translation was refactored to go through this same new `toSvgPagePoint` so there's one source of truth for "world point → svg-local point" in this module, not two.
  - **No PDF-style shading-function machinery needed at all**: PDF's stops require a hand-built stitching `Function` object (`getPdfGradientColorFunction`) because a PDF shading pattern only has an abstract math function, no first-class stop list. SVG's `<linearGradient>`/`<radialGradient>` take literal `<stop offset="t" stop-color="#hex" stop-opacity="a"/>` children (`getSvgGradientStops`) — the entire `getPdfGradientStitchingFunction`/`getPdfGradientColorFunction`/`getPdfGradientColorLookupProgram` category of PDF code has no SVG counterpart at all.
  - **No soft mask needed for translucent stops either**: PDF's per-stop alpha requires a whole second luminosity-soft-mask Form XObject (`getPdfGradientSoftMaskState` and friends) because a PDF shading has no alpha channel. SVG's `stop-opacity` is just another literal per-stop attribute (`getSvgGradientStops` sets it directly from `stop.opacity / 100`, unscaled by the paint's own ambient opacity — exactly like PDF's per-stop alpha function, since the path's own `fill-opacity` and each stop's `stop-opacity` naturally multiply together during rendering without either needing to bake the other in first).
  - **Registration** (`registerSvgGradientDef`): far simpler than PDF's `registerPdfPattern`/`registerPdfPatternInDict` reaching into a raw `/Resources` dict — `createSvgBlob` just threads a second `defs: string[]` accumulator alongside `elements: string[]` all the way down through `drawSvgShape`→`drawSvgBoxShape`→`drawSvgPaintPolygons`→`drawSvgGradientPolygons`, and `registerSvgGradientDef` assigns each gradient a `XigmaGradient${defs.length}` id (mirrors the `/XigmaPattern0` naming PDF already uses) and pushes its built `<linearGradient>`/`<radialGradient>` string. The final markup wraps whatever accumulated in `defs` as one `<defs>...</defs>` block right after the opening `<svg>` tag (omitted entirely when empty, keeping a gradient-free export's markup unchanged from before this stage).
  - **Eligibility** (`isSvgVectorPaint.ts`): `SUPPORTED_PAINT_TYPES` grew from `['solid']` to `['solid', 'gradient-linear', 'gradient-radial']` at this stage, then to all five paint types once angular/diamond joined (see below).
- **Angular and diamond gradients as an approximated fan/ring of flat `<path>`s** (`drawSvgAngularGradientPolygons`, `drawSvgDiamondGradientPolygons`; shared helper `getSvgGradientColorAt`): SVG has no conic or Manhattan-distance gradient primitive at all (unlike PDF, which builds an exact one out of a hand-written Type 4 PostScript function evaluated per pixel by the viewer), so these two are approximated by subdividing the canvas shader's own per-pixel formula (`vectorGradientFillFragmentShaderSource.ts`: angular is `atan2(b,a)/2π` where `a,b` are *not* normalized by `primaryRadius`, scale-invariant; diamond is `|a|+|b|` where `a,b` *are* normalized by `primaryRadius`/`primaryRadius·radiusRatio`) into many discrete flat-colored `<path>` shapes, each drawn with the existing `drawSvgPolygons` primitive — no new low-level SVG markup builder was needed, only geometry generation.
  - **`getSvgGradientColorAt(stops, t)`**: a plain JS port of PDF's `getPdfGradientColorLookupProgram.ts` segment/lerp algorithm (sort stops, pad flat segments before the first/after the last stop if they don't span `[0,1]`, linear RGB+opacity lerp within a bracketing pair) — PDF only ever emits this as PostScript text, so it wasn't directly reusable and had to be ported to a real callable function returning `{ color, opacity }` at a given `t`.
  - **Angular** (`drawSvgAngularGradientPolygons`, `ANGULAR_GRADIENT_SECTOR_COUNT = 120`, i.e. 3° per sector): each sector is one flat-colored triangle from the gradient center (`getSvgGradientGeometry`'s `start`) to two boundary points on the warped ellipse at the sector's start/end angle (`getSvgAngularGradientPoint`, solving the shader's `a,b→angle` formula in reverse: `point = start + reach·cos(θ)·direction + reach·sin(θ)·radiusRatio·perpendicular`), colored at the sector's *midpoint* angle. `getSvgAngularGradientReach` picks a generously large `reach` (4× the farthest fillBounds corner's distance from the center) so every sector triangle fully covers the shape regardless of direction — cheap to over-provide since excess gets clipped away (see below), so no need for the precise per-angle minimum-reach math.
  - **Diamond** (`drawSvgDiamondGradientPolygons`, `DIAMOND_GRADIENT_BAND_COUNT = 64`): unlike angular, diamond's `|a|+|b|` metric is *exactly* piecewise-linear (not merely approximated by discretization for its own sake — the discretization here is purely to get smooth-looking color transitions, same motivation as angular), so each band is a flat-colored **ring** between two concentric diamonds (`getSvgDiamondGradientPolygon`: 4 corners at `start ± d·primaryRadius·direction` and `start ± d·primaryRadius·radiusRatio·perpendicular`, i.e. the same per-axis warp `getSvgRadialGradientDef`'s matrix already uses, just with straight diamond edges instead of an ellipse), drawn as one `<path>` with both the outer and inner diamond sub-paths and `fill-rule="evenodd"` (the same outer-minus-inner donut technique already used for stroke rings) — reusing `drawSvgPolygons` directly, no new ring-drawing primitive. `getSvgDiamondGradientReach` computes the *exact* minimum reach needed (not a generous guess): the max `|a|+|b|` over the fillBounds corners (falling back to the fillBounds diagonal when the gradient axis is degenerate, `primaryRadius === 0`), floored at `1` so a shape entirely inside the gradient's own defined span still gets full band resolution across it, ×1.1 margin.
  - **Clipping**: both reuse the *exact* `getSvgImageClipPathDef`/`registerSvgDef` mechanism built for the image-fill stage — every generated sector/ring is generously oversized to guarantee full shape coverage, then the whole batch is wrapped in one `<g clip-path="url(#XigmaClipN)">...</g>` referencing the shape's own fill polygon, letting the renderer do the sector-vs-shape intersection instead of computing polygon clipping by hand (no polygon-clipping algorithm exists or was needed anywhere in this codebase).
  - **Opacity**: since each sector/ring is a single flat SVG fill (not a native gradient with its own per-stop `stop-opacity`), the ambient paint opacity and the interpolated per-position stop opacity are multiplied together in JS before being passed to `drawSvgPolygons` as one `fill-opacity` value, rather than relying on SVG's own opacity stacking the way native `<linearGradient>`/`<radialGradient>` stops do.
  - **Side effect**: since both are dispatched through the same shared `drawSvgPaintPolygons`/`isSvgVectorPaint` machinery every other paint type already uses, pen-tool vector node faces and text-on-a-path curves automatically gained angular/diamond support too, with no extra wiring — confirmed by `canExportVectorNodeAsSvgVector`'s existing angular/diamond test flipping from reject to allow once the shared gate changed.
- **Raster fallback as a data URI** (`embedSvgRasterLayer`): renders through the same `renderNodeForExport` used everywhere else, then a new `blobToDataUrl` util (`utils/blobToDataUrl.ts`, plain `FileReader.readAsDataURL` wrapped in a promise) turns the resulting PNG/JPEG blob into a `data:` URI embedded directly as `<image href="..." x="0" y="0" width="…" height="…"/>` — no external file reference, so the exported `.svg` stays a single self-contained file. `flattenPixelsToOpaqueWhite.ts` was promoted the same way as the shape-geometry helpers (from `pdf/` to `Export/utils/` root) once SVG's sole-raster-layer JPEG path needed the identical opaque-white pre-composite PDF already used.
- **Pen-tool vector shapes** (`drawSvgVectorNodeShape`, orchestrating `drawSvgVectorFills`/`drawSvgVectorStroke`/`drawSvgVectorRoundedCaps`; eligibility `canExportVectorNodeAsSvgVector`): byte-for-byte the same three-file split and orchestrator as PDF's `drawPdfVectorNodeShape`/`drawPdfVectorFills`/`drawPdfVectorStroke`/`drawPdfVectorRoundedCaps`, reusing the identical shared canvas geometry (`getRenderedVectorNode` to bake the node's own rotation into vertices/segments/tangents first, `groupFilledFacesForRendering` for per-face fills including gradient faces now that `drawSvgPaintPolygons` handles both, `getVectorNodeBounds` as the gradient `nodeBounds`, `getVectorNodeThickStrokeVertices`+`getStrokeTrianglePolygons` for the stroke triangulation, `getOpenVectorEndpoints`+`getEllipsePoints` for round caps at open path ends). `getStrokeTrianglePolygons.ts` (a plain `number[]` → `TPoint[][]` reshape of a flat GL triangle-list, no PDF concept in it at all) was promoted the same way as the shape-geometry helpers before it, from `pdf/` to the global `utils/canvas/vectorNetwork/` this time (matching where its sibling `getVectorNodeThickStrokeVertices` already lives) rather than `Export/utils/` root, since its domain vocabulary (`TPoint`, GL triangle vertices) is vector-network geometry, not export-eligibility logic. The stroke triangles are filled with `fill-rule="nonzero"` (not `evenodd`) — same reason as PDF: adjacent stroke triangles legitimately overlap at concave corners, and even-odd would punch a hole there. `canExportVectorNodeAsSvgVector`'s own fill-group check uses `isSvgVectorPaint` (now solid and all four gradient types, matching PDF's `isPlainPaint`), consistent with every other SVG eligibility predicate in this stage.
- **Text** (`canExportTextAsSvgRealText`/`drawSvgTextNode` for real text, `drawSvgTextCurves` for text-on-a-path): the same three-tier routing PDF's text export uses (real text → vector curves → raster), but simpler on both tiers since SVG needs none of PDF's page-space or font-embedding machinery.
  - **Real text** (`drawSvgTextNode`): emits one `<text fill="#hex" font-family="Inter, sans-serif" font-size="…">` wrapping one `<tspan x="…" y="…">char</tspan>` per glyph — positions come from the *exact* same `getStraightTextGlyphPlacements(MSDF_ATLAS_JSON, node)` PDF's `drawPdfTextNode` already uses (same line-wrapping, same per-glyph advance/baseline math), just without PDF's per-glyph bottom-up Y-flip (`toSvgPagePoint` is translate-only, same as every other SVG drawer). Per-glyph placement (rather than one `<text>` per line, letting the browser's own text layout/kerning run) guarantees the same visual line-wrapping and spacing as the canvas and PDF regardless of which font the SVG viewer actually renders the glyph shapes with — a glyph missing from the atlas is silently skipped, mirroring PDF. Each character is XML-escaped (`escapeSvgText.ts`, `&`/`<`/`>` only — the only characters that could break `<tspan>` content). **No embedded/subsetted font**: unlike PDF (which embeds one shared, non-subsetted Inter TTF via fontkit for the whole document and gates real-text eligibility on that font's character coverage), SVG has no equivalent self-contained embedding used here, so `canExportTextAsSvgRealText`'s eligibility is PDF's `canExportTextAsRealText` minus the `fontCharacters` check — any character is allowed, since there's no font subset to miss it from. The tradeoff: an SVG viewer without Inter installed substitutes a fallback font's glyph *shapes* at the *same* precomputed positions, so spacing/wrapping still matches the design exactly, only the letterforms themselves may differ.
  - **Text curves** (`drawSvgTextCurves`): a near-verbatim port of `drawPdfTextCurves` — resolves the path node, calls the same format-agnostic `getTextFlattenVector(MSDF_ATLAS_JSON, node, pathNode)` to flatten the glyphs into one merged `TVectorNode`, then draws it with `drawSvgVectorFills` (already existing, reused unchanged from the pen-tool-vector stage) instead of `drawPdfVectorFills`. `canExportTextOnPathAsVectorCurves.ts` had zero PDF-specific logic in it already (pure eligibility/geometry over `isSafeAncestorChain`), so it was promoted from `pdf/` to `Export/utils/` root and is now imported unchanged by both formats, rather than being duplicated into a `canExportTextOnPathAsSvgVectorCurves.ts`.
  - **Eligibility gates disqualifying real text stay identical to PDF's** (rotation, flip, stroke, blend mode, hidden, empty content, unsafe ancestor) — the text node's *own* rotation and *own* blend mode must still be exactly `0`/`normal` (PDF has the same requirement; `getStraightTextGlyphPlacements` lays out glyphs axis-aligned with no rotation math at all, and a single flat `<text>` element has no way to isolate-and-blend just itself), but a *rotated, blended or translucent ancestor* is now allowed for both formats, same as any other node — see the ancestor-rotation and blend/opacity bullets above for how SVG's local-decomposition + `<g>` wrapping (and PDF's own flat, absolute-coordinate, `getEffectiveOpacity`-composed drawing) both handle that correctly.
- **Images and video** (`drawSvgImagePaint` for Frame/Rectangle image/video fills, `drawSvgMediaNodeShape` for a standalone `NodeType.media` layer; eligibility `isSvgVectorFillPaint`/`canExportMediaNodeAsSvgVector`) — an SVG-only capability with no PDF counterpart to port from (PDF still flattens all image/video content to raster), covering all four fill modes plus the standalone media node:
  - **Asset bytes** (`loadSvgImageAsset`): `paint.ref`/`node.src` is always a plain, directly-fetchable blob URL in this app (images: `URL.createObjectURL` at upload time; video: the one still frame `extractVideoFrame.ts` extracts, since the document model never keeps the real video bytes past that extraction step) — no asset store, no re-encoding needed for the common case, so `fetch(ref).then(r => r.blob())` recovers the exact original bytes and `blobToDataUrl` (the same util the raster fallback already uses) embeds them verbatim as a self-contained `data:` URI. A failed fetch (revoked blob URL, network error) resolves to `null` and the paint draws nothing, same silent-skip convention as a failed raster render.
  - **Placement per scale mode** (`getSvgImagePlacement`): `fill`/`fit` place the `<image>` at the shape's own local (unrotated) rect and let SVG's native `preserveAspectRatio` (`xMidYMid slice` / `xMidYMid meet`) do the cover/contain math automatically from the embedded file's real dimensions — no manual UV/aspect-ratio arithmetic needed here, unlike canvas's `getImageFillCoverUv`/`getImageFillContainRect`. `crop` places the `<image>` at the crop rect exactly (`preserveAspectRatio="none"`, stretching the whole image into it) with its own `rotate()` transform from `crop.rotation` — confirmed via `rotateNodesRigidly.ts`/`continueRotateDrag.ts` that `crop.x/y/rotation` are already stored in the same absolute world space as the node itself and kept rigidly in sync when the node rotates, so no extra composition with the node's own rotation is needed (`crop.rotation` replaces it, exactly like canvas's own `quadRotation = crop ? crop.rotation : boxRotation.degrees`). The shape's own rotation and rounded corners are handled the same way solid fills already are — `getSvgImageClipPathDef` builds a `<clipPath>` from the identical rounded-rect polygon (`getBoxFillPolygon`) already used for the solid-fill `<path>`, and `getSvgRotateTransformValue` wraps the `<image>` in `transform="rotate(deg cx cy)"` when the node itself is rotated (SVG's own rotate direction is positive-clockwise in a Y-down system, the same convention `rotatePoint`/every other SVG rotation in this module already uses, so no sign flip anywhere).
  - **Tile mode** (`getSvgImagePatternDef`): the one mode with no direct `<image>`-attribute equivalent — registers a `<pattern patternUnits="userSpaceOnUse">` (tile size = the asset's real pixel size × `paint.scale`, default `IMAGE_FILL_DEFAULT_TILE_SCALE`) containing one `<image>`, with `patternTransform` carrying the shape's own rotation (mirrors how gradients already use `gradientTransform` for the same purpose), and fills the shape's own polygon path directly with `fill="url(#pattern)"` — reusing `drawSvgPolygons` unchanged, exactly like a gradient does, instead of drawing a separate clipped `<image>` element.
  - **The image's own orientation** (`paint.rotation`, a 0/90/180/270 step independent of the shape, canvas applies it as a pure UV-corner remap via `getRotatedFillUvCorner`) **and `flipX`/`flipY` are baked into the embedded raster bytes themselves** (`bakeSvgImageOrientation`: draw the fetched bitmap onto an offscreen 2D canvas, translated/rotated/scaled, then re-exported as a new PNG blob) rather than expressed as an SVG `transform`, whenever either is non-default — this is the one case where verbatim byte passthrough isn't possible. The reason: SVG's `preserveAspectRatio` computes its cover/contain math against the embedded file's *real* intrinsic pixel dimensions, which a wrapping `transform` can't change — a 90°-rotated landscape photo needs its *effective* aspect ratio swapped before `fill`/`fit` placement math runs, which only baking the rotation into new pixel bytes achieves correctly. Confirmed by real visual verification (below) that the un-baked, rotation-independent case (the common one — most images are never rotated within their frame) round-trips byte-for-byte.
  - **Excluded, falls back to raster**: any image paint with non-default color adjustments (exposure/contrast/etc., `hasDefaultImageAdjustments` in `isSvgVectorFillPaint.ts`) — no SVG filter primitive matches the canvas shader's adjustment math closely enough to be worth approximating. Image/video paints are also excluded from *stroke* eligibility (`isSvgVectorFillPaint` is fill-only; `canExportBoxShapeAsSvgVector`'s stroke check still uses the plain `isSvgVectorPaint`) — an image-filled stroke would need the stroke-ring polygon as its clip shape instead of the fill polygon, out of scope for this stage.
  - **Standalone media node** (`drawSvgMediaNodeShape`, `TMediaNode` newly added to `TSvgShapeNode`/`VECTOR_CANDIDATE_TYPES`): much simpler than a paint fill — no `scaleMode`/`crop`/adjustments in its data model at all, it always stretches to `node.width`×`node.height` (`preserveAspectRatio="none"`, no clip-path since it has no rounded corners), with only `flipX`/`flipY` (baked, same as an image paint) and the node's own rotation (`transform="rotate(...)"`) to account for.
  - **Async ripples through the whole vector-drawing chain**: fetching an asset is inherently asynchronous, so `drawSvgPaintPolygons` (shared by box fills, pen-tool vector fills, and text curves) became `async`, cascading `await` up through `drawSvgVectorFills` → `drawSvgVectorNodeShape`/`drawSvgTextCurves` → `drawSvgShape` → `createSvgBlob`'s draw loop — none of those other callers ever actually hit an `await` point in practice (their own eligibility gates never let an image paint through), but the type signature has to accommodate it regardless. A `for...of` loop (not `.forEach`/`Promise.all`) walks each paint layer's `await` sequentially, since paints can legitimately stack solid+image+gradient layers in one `fills` array and the emitted `<path>`/`<image>` elements must land in the output in that same paint order — concurrent awaits would risk them resolving (and being pushed to the shared `elements` array) out of order.
- **Verified with real generated SVGs, not just unit tests**: Stage 1 (plain shapes) — a small scene (rounded rectangle with a stacked translucent fill plus a stroke, a stroked ellipse, a rotated hexagon, a star, and an arrow-tipped line) exported through the real, unmocked `createSvgBlob` and rendered via macOS Quick Look — every shape appeared correctly shaped, colored, positioned and rotated, confirming the coordinate math (no Y-flip needed, unlike PDF) is correct end to end. Stage 2 (gradients) — a diagonal red-to-translucent-blue linear gradient and a 20°-rotated yellow-to-green elliptical radial gradient, both rendered correctly (the radial gradient's ellipse rotates *with* its shape, confirming the `gradientTransform` matrix carries the rotation through exactly like PDF's Pattern `Matrix` does). Stage 3 (pen-tool vector shapes) — a 5-vertex pen-tool star/pentagon shape with a linear-gradient face fill, a round-joined uniform stroke and round end caps, rendered correctly end to end (the real, unmocked face-detection pipeline needed a first verification attempt reworked: a hand-picked `filledFaceKeys`/`fillByKey` key like PDF's own integration test uses doesn't match the real geometry engine's derived face keys, so — same as `createPdfBlob.spec.ts`/`createSvgBlob.spec.ts`'s own unit tests already do — `getVectorFillLoopPoints` was mocked to isolate the already-covered face-detection subsystem from the new SVG-drawing code actually being verified). Stage 4 (text) — a real text node ("Hello SVG export!", real Inter atlas metrics, no mocks) exported and rendered via Quick Look: legible, correctly kerned/positioned, top-left anchored as expected. The text-curves tier (text on a path) could **not** get the same live-render treatment: `getTextFlattenVector`'s `loadInterFont.ts` loads the actual glyph outlines via `fetch(interFontUrl)`, a browser-only asset-URL fetch that throws outside a real dev-server/browser context (including plain Vitest), unlike PDF's own font loader (`loadPdfFontBytes.ts`, a plain `readFileSync`) — so this tier's correctness instead rests on the exhaustive mocked integration test in `createSvgBlob.spec.ts` (confirms the real `<path>` fill markup is emitted, not a raster fallback) plus the fact that the actual fill-drawing call (`drawSvgVectorFills`) is the identical, already visually-verified function the pen-tool-vector stage already exercised live. Stage 5 (images/video) — a real generated PNG (a 100×100 four-color quadrant image, `fetch`/`createImageBitmap` mocked to the browser-only boundary but every geometry/markup line real and unmocked) exported as four side-by-side shapes and rendered via Quick Look: cover mode filled a rounded-corner square cleanly with the whole image (a square-into-square cover has nothing to crop, but the rounded clip renders correctly); fit mode correctly letterboxed the square image inside a wider, shorter box instead of stretching it; crop mode showed exactly the expected small rotated (20°) window of the image at the exact crop rect position; tile mode showed a correctly repeating, correctly-rotated-with-its-shape (15°) checkerboard of the image via the `<pattern>`/`patternTransform` mechanism — confirming the trickiest new geometry (crop-rect rotation independent of shape rotation, and pattern rotation via `patternTransform`) renders exactly as designed. The rotation-bake path (`paint.rotation`/`flipX`/`flipY` baked into new PNG bytes) could not get the same live-render treatment — it needs a real `<canvas>` 2D context to draw into, which isn't available under Vitest/jsdom, mirroring the exact same browser-API gap the text-curves tier hit — so that path rests on `bakeSvgImageOrientation.spec.ts`'s mocked-but-exact-call-sequence assertions instead (translate/rotate/scale/drawImage in the right order with the right values), not a rendered image. Stage 6 (angular/diamond gradients) — a 4-stop rotated (20°) angular gradient and a 3-stop rotated (-15°) diamond gradient with `radiusRatio: 0.6`, both real and unmocked (no browser-API gap this time, unlike text-curves/image-rotation-bake — gradient math is pure JS), rendered via Quick Look: the angular sweep showed a clean, smooth red→yellow→green→red conic fan rotated correctly with its rounded-rect shape and cleanly clipped to the rounded corners; the diamond gradient showed the correct straight-edged rhombus shape (visibly distinct from a circular radial gradient), correctly compressed by `radiusRatio` and rotated with its own shape — confirming the reverse-engineered `angle→point`/`distance→diamond-corners` formulas and the reused clip-path mechanism all render correctly end to end. Stage 7 (nested `<g transform>` groups for rotated ancestors) — a 45°-rotated gray Frame containing a red Rectangle (own local rotation 0, carried entirely by the wrapping `<g>`) and a blue "Rot" text node (own absolute rotation 0), rendered via Quick Look: the Rectangle appeared rotated together with its Frame as expected, and critically the text rendered perfectly horizontal despite being nested inside the rotated group — confirming the local-decomposition math and the `drawSvgTextNode` counter-rotation fix compose back to the correct absolute result, not just in the unit-tested numeric examples but in a real rendered image. Stage 8 (blended/translucent ancestors) — an orange background rectangle, a `blendMode: multiply` frame (its own fill correctly fell back to raster and was mocked out — a pre-existing, unrelated restriction on that node's *own* blend mode — while its cyan child rectangle was real and unmocked) containing a cyan rectangle, and a black text node under an `opacity: 0.3` frame ancestor: rendered via Quick Look, the cyan rectangle appeared as medium green exactly where it overlapped the orange background — the mathematically correct `multiply(#ff8800, #00ffff)` result, confirming a real SVG renderer (not just string-matched markup) applies `mix-blend-mode` correctly through the emitted `<g style="mix-blend-mode: multiply; isolation: isolate">` — and the text rendered visibly faded rather than solid black, confirming `getEffectiveOpacity`'s ancestor-composed opacity reaches the real `<text opacity="...">` attribute.

### One open panel for Fill, Stroke and Effects rows (`openPropertyPanel`)

`design.openPropertyPanel` (`{ nodeId, property: 'fills' | 'strokes' | 'effects', index }`, transient, cleared when the selection changes, closed only by `closeOpenPropertyPanel` when the same panel is named) is the single source of truth for which row's picker / settings panel is open. `useOpenPickerIndex(nodeId, property, initialIndex)` derives each section's `openPickerIndex` from it, so opening one panel closes any other, also across sections. The plus in Fill and Stroke adds the item and opens its picker (`onAdd` calls `onPickerOpenChange(fills.length, true)`); in Effects the panel opens after a type is chosen from the menu. Two focus details keep the new panel from being dismissed: `Popover` takes `onCloseAutoFocus`, `EffectsMenu` skips returning focus to the plus after a choice, and `EffectRow` returns focus to its trigger only when the user closes the panel itself (`useReturnFocusOnUserClose`). Row selection is per property (`selectedFillIndices` / `selectedStrokeIndices`), otherwise an empty Stroke list trims the Fill selection.

### Right panel scrolling

`RightPanel` is a flex column: `Header` keeps its natural height, `RightPanel__properties` (`flex: 1;
min-height: 0; position: relative`) wraps `RightPanel__properties-scroll` (`overflow-y: auto`, native bar
hidden with `scrollbar-hidden`) plus the shared `ScrollThumb`, which only renders when the content
overflows. No `calc()` with the header height. The floating (minimized) panel is pinned with
`top: 12px; bottom: 12px` (`top: 32px` with rulers) instead of `100vh` min/max-height arithmetic, so it
can't be squeezed differently at the top when rulers show. e2e #515 in `fill-section.spec.ts`.

### Muted empty sections (`Section` `mutedWhenEmpty`)

Opt-in per section (Export, Fill and Stroke today): while the section has no content (`hasContent`) and isn't
hovered, `Section--muted` turns the label and the header icons (`svg-color` on `Section__component`)
`neutral-2`, and hides anything tagged `data-section-idle-hidden` (the shared `Common/ApplyStylesButton` — `StylesAndVariables` icon, used by Fill and Stroke —
`opacity: 0`); hover or any content restores `neutral-1` / full opacity. All of it transitions
`0.1s ease-out` (color, fill, stroke, opacity). See the Stroke section below. e2e #514 in `fill-section.spec.ts` covers Fill.

### Appearance: Blend mode row

`Common/AppearanceSection/BlendModeRow/` renders under the Opacity / Corner radius rows only while the
node's `blendMode` is set to something other than `passThrough` (the header drop button still sets and
clears it): a "Blend mode" `SectionColumn` (`single`) holding an outline `UITools.Dropdown` (new optional
`icon` prop = leading `DropEmpty`, options from `BLEND_MODE_GROUPS.flat()`, `onHoverOption` writes the
same `blendMode.previewRef` the header menu uses so hovering previews live) and a `Minus` `ButtonIcon`
(tooltip "Remove", aria "Remove blend mode") that commits `passThrough`. Same `commitBlendModeChange`
as the header button, so both stay in sync. e2e #513 in `appearance-panel.spec.ts`.

### Contrast checker (Solid tab only)

Figma-style "Check color contrast": the last icon in `PaintTypeRow`'s trailing `__extra` wrapper (next to
the blend mode button, wrapper reserved for exactly this). User: "tylko dla solid ... ren saturation map
ma takie kroki i jakiś łuk po którym są kolory dopasowane kontrastowo do jego parenta. Czyli jak jest na
canvas to z canvas ale jak jest w frame to z frame". Full scope shipped at once; fallback when no parent
has a usable fill = page background ("Bierzesz z canvas").

- **Math** (global, `utils/color/`): `getRelativeLuminance` + `getContrastRatio` (WCAG 2.1), and
  `truncateContrastRatio` — the ratio is **truncated, not rounded** (Figma shipped a rounding bug where
  4.499 showed as a pass), and pass/fail compares the truncated value. Thresholds live in
  `ContrastChecker/constants.ts` (graphics AA 3; large text AA 3 / AAA 4.5; normal text AA 4.5 / AAA 7);
  `Auto` resolves to Graphics because a shape fill picker has no text context; AAA is disabled for
  Auto/Graphics.
- **Curve** (`SolidPanel/ContrastChecker/utils/`): for the current hue, every saturation column has
  luminance monotonic in V, so `findVForLuminance` binary-searches V for a target luminance.
  `getContrastBoundaries` solves the WCAG ratio for the two possible foreground luminances
  (`lighterBound = ratio*(Lbg+.05)-.05`, `darkerBound = (Lbg+.05)/ratio-.05`), keeps those inside [0,1],
  and samples each with `getIsoContrastCurve` (101 saturation samples; columns that can't reach the
  luminance clamp to v=100 so the curve spans the full width). Luminance is searched on the unrounded
  `hsvToRgbFloat` — the 8-bit `hsvToRgb` made the curve jagged. `getFailRegionPolygon` builds the
  failing area (one boundary: curve to the v=0/v=100 edge; two: the band between them) for the dotted
  texture. `getNearestPassingHsv` = auto-correct: same hue+saturation, V moved to the nearest boundary.
- **Rendering**: `SaturationMap` takes optional `contrastBoundaries`; `ContrastOverlay` draws an SVG
  polyline per boundary and a `clip-path: polygon(...)` dotted div (no SVG `<pattern>` ids to collide).
  Points are `s%`, `(100-v)%` — same mapping as the thumb.
- **State**: `useContrastChecker(hsv, backgroundColor, onCorrect, unsupportedReason)` is called in
  `ColorPicker.tsx` (lifted so `PaintTypeRow`'s toggle and `SolidPanel`'s row share it) and only wired
  when `contrastBackgroundColor` **or** `contrastUnsupportedReason` is provided (a locked background has
  no color but must still offer the toggle — caught by e2e), so the vector paint tool's picker never
  shows it. `isActive`/`category`/`level` live in the module-level `contrastCheckerStateCache`
  (restored on mount, written on change) so the choice survives closing the picker or reselecting; specs
  reset `contrastCheckerStateCache.current` in `beforeEach`.
- **Auto-correct preview**: hovering the level button (`onAutoCorrectHoverChange`) makes `SaturationMap` draw a
  small white-bordered marker filled with the color a click would apply (`correctionPreview` from
  `useContrastChecker`). The target is `getCorrectionTarget`: the nearest point (straight-line in the s/v
  plane) on any boundary polyline (`getNearestBoundaryPoint` + `projectPointOnSegment`; the clamped tail
  that runs into the top edge is excluded), nudged in 0.05 V steps until the truncated ratio really passes.
  Click applies exactly that target (`applyContrastCorrection`) and clears the hover state — the button gets
  `pointer-events: none` once passing and never reports `mouseleave`, which used to resurrect the preview
  on later map drags. Overlay-only helpers (`getFailRegionPolygon`, `getVisibleCurve`, `toSvgPoints`,
  `toClipPathPoints`) live in `SaturationMap/ContrastOverlay/utils/`.
- **Row UI** (`SolidPanel/ContrastChecker/`, 24px high, horizontal padding only): `ContrastValuesButton`
  (inline `assets/icons/contrast.svg?react`, recolored via `data-svg-property="fill-background"` /
  `"fill-foreground"` and CSS vars; opens a 180px "View color values" popover with Foreground/Background
  swatches + hex); on the right a `UITools.ButtonIcon` (`Check`/`NotAllowed` icon + level text as
  `endAdornment`; click = auto-correct, `pointer-events: none` while passing; tooltip only when failing)
  and the settings popover (`selected` while open, tooltip "Contrast settings"). While locked, `SolidPanel`
  renders `ContrastUnsupported` (shared `ContrastLocked` icon + 11px message, 24px high) instead of the row,
  and no overlay.
- **Background resolution** lives in `FillRow` (it owns `nodeId`; `ColorPicker` stays store-free):
  `useContrastBackground(nodeId)` -> `getContrastBackground` returns `{ color }` or `{ reason }`
  (a `TContrastUnsupportedReason` that locks the checker and shows `ContrastUnsupported`). Rules, in order:
  1. any ancestor with an active appearance `blendMode` -> `backgroundBlendMode`;
  2. walking ancestors nearest-first (`getAncestorChain`), per node the dominant fill is the visible fill
     with the highest opacity (ties: the higher one in the list); no visible fill -> go to the parent;
     a section's plain `fill` counts as opaque solid;
  3. the dominant fill having a blend mode -> `backgroundBlendMode`; non-solid -> `gradientBackground` /
     `patternBackground` / `imageBackground` / `videoBackground`;
  4. a solid below 100% is a legit background, composited (`blendHexColors`) over what resolves beneath
     it (same walk); an unsupported result beneath propagates;
  5. reaching the canvas: hidden or 0% opacity `backgroundPaint` -> `mixedBackground`, else its color.
  The foreground reason (`getContrastUnsupportedReason`: the edited fill or its node has a blend mode)
  wins over the background one. Covered by `e2e/design/panels/fill-section.spec.ts` (#503–#512).
- **Icons**: toggle is the shared `Contrast` icon, settings is `Properties`, `ContrastLocked` and
  `NotAllowed` were added to `xigma-app-shared`; the two-tone swatch is the local `contrast.svg` (fixed
  fill slots, not `Icon`).
- Not applicable to Color Styles/Variables in Figma (no single background); irrelevant here since
  there are none yet.
- Nested `<button>` gotcha: `UITools.Popover` needs `asChild` when its trigger is a `ButtonIcon`
  (caught by the e2e run's console error, fixed).

## Adding a panel for another node type

1. Route it in `PanelProperties.tsx`.
2. Compose it from `Common/` sections; move any section that a second panel now needs from the
   node folder into `Common/` (keep the i18n keys under `…panelProperties.common.*`) and widen its
   hooks' node-type gate to `isBoxSceneNode`.
3. Add `…panelProperties.<node>.*` i18n, a `<Node>.spec.tsx`, and an e2e in
   `e2e/design/panels/` if the panel drives canvas geometry (dimension/position edits do).

### Progressive layer blur handles

A Layer blur set to Progressive stores `start` / `end` points (normalized 0-1 in the node, defaults top center -> bottom center, `getProgressiveBlur` resolves the defaults) next to `startBlur` and `blur`. While that effect's panel is open (`openPropertyPanel`, `getOpenProgressiveBlur`) the canvas draws the line and two round handles (`drawProgressiveBlurHandleLayer`, reusing the gradient line and endpoint drawers) and a blue `Start 0` / `End 4` label up and to the right of the hovered or dragged handle. Hit-testing, arm / continue / disarm and hover follow the gradient endpoint move drag exactly (`getProgressiveBlurHandleAtPoint`, `armProgressiveBlurOnPointerDown`, `continueProgressiveBlurDrag`, `disarmProgressiveBlurDrag`, `resolveProgressiveBlurHover`, refs in `refs.progressiveBlur`), placed before the gradient and resize resolvers because the start point sits on the top-center resize handle. Dragging writes the point through `updateNode` inside the pointer-down history gesture, and snaps to the node's edges and center (0 / 0.5 / 1) through `getGradientMoveSnapPoint` with the alignment guide. `EffectRow` ignores the outside press on a handle (`useIgnoreProgressiveBlurInteractOutside`) so the panel stays open.

A layer can have only one blur: `getDisabledBlurTypes(effects, editingIndex)` disables both Layer blur and Background blur in the plus menu, and in another row's type menu, once a blur exists (the effect being edited does not count against itself).

### Noise effect

A Noise effect stores `noiseType` (Mono / Duo / Multi, default Mono), `noiseSize` (blob size in node units, default 0.5; the Y field is read-only and shows the same value), `density` (0-100, default 100, shown as `100%`), color, opacity, `secondaryColor` / `secondaryOpacity` (Duo only, default white 25%) and blend mode; `getEffectNoise` and `getEffectFieldValue` resolve the defaults. `getEffectPanelLayout` (a `switch` on the type) gives it the blend mode droplet, the `EffectNoiseTypeToggle` (Mono / Duo / Multi, the choice goes through `useSelectNoiseType`), the fields from `EFFECT_NOISE_FIELDS` (`isReadOnly`, `unit: '%'`, `ariaKey` for the Y field) and the color row. Multi has no color row (its colors come from the noise) and uses `EFFECT_NOISE_MULTI_FIELDS`, which adds an Opacity field (`opacity`, 0-100%) after Density. A Glass effect (rendered on the canvas underneath the node as a refracted, chromatically-dispersed backdrop with a thin picture-frame bevel around its border, see canvas-rendering-pipeline.md section 14's `applyGlassEffect`) stores `lightAngle` (-180..180, default -45), `lightIntensity` (0-100, default 80), `refraction` (80), `depth` (20), `dispersion` (50), `frost` (4) and `splay` (0), all optional with `getEffectGlass` resolving the defaults. Its layout has no blend mode, color or plain fields and turns on `hasGlassControls`, which renders `EffectGlassControls`: a Light row with `EffectGlassLight` (a 62x55 dial: the `@xigma/assets/glass-space.svg?react` shape rotated by the angle with the intensity as its opacity, a small marker in the middle and the `Light` icon placed on an ellipse around it by `getGlassLightPosition`; `useGlassLightDrag` turns a pointer position into the angle with `getGlassLightAngle`, 0 = straight up, clockwise, and wraps the drag in the panel's `onDragStart` / `onDragEnd` history gesture) next to two `EffectGlassNumberField` inputs (angle with `°`, intensity with `%`, `getEffectNumberFromInput` strips both signs), a divider, and five `UITools.SliderInput` rows (`EFFECT_GLASS_SLIDERS`, 0-100). `UITools.SliderInput` is the reusable slider plus number input: a compact `UITools.Slider` in a field-colored box and a 48px `TextField` whose blur commits through `useSliderInputBlur` (`getSliderInputValue` clamps and rounds to two decimals); its aria labels are the given one for the input and `<label> slider` for the track; its input has no icon but a `UITools.ScrubbableEdge` start adornment (an 8x24px strip on the left edge wrapped in the library `ScrubbableInput`: hovering it shows the `ew-resize` arrows cursor (no highlight line), dragging scrubs the value, with `onDragStart` / `onDragEnd` for the history gesture) and a `Tooltip` whose text is the row label (`settings.labels.*`, both Light inputs say `Light`). The two Light inputs (`EffectGlassNumberField`) get the same edge and tooltip; the dial has none. A Texture effect stores `noiseSize` (Size, X is editable and Y read-only, default 4), `radius` (default 4, `getEffectTexture` resolves the defaults; `createEffect` seeds both) and `clipToShape`; its layout (`EFFECT_TEXTURE_FIELDS`) has no blend mode or color and turns on `hasClipToShape`, which shows `EffectClipToShapeField` (a `UITools.Checkbox`, e2e value `effect-clip-to-shape`) under a divider. `EFFECT_FIELD_MAX` clamps the density on blur, scrub and arrow keys, and `getEffectNumberFromInput` accepts a trailing `%`.

For a Duo noise `getEffectPanelLayout` sets `hasSecondaryColor`: the color row is labelled Colors and a second `EffectColorField` (the same component the first row uses) edits the second color.
