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
  (still non-functional) Blend mode button in the section header. Gates on `isAppearanceNode`
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
  (`canvas-rendering-pipeline.md`'s corner-radius section). The eye button dispatches
  the pre-existing `toggleNodeHidden` (already cascades to descendants via
  `cascadeSetGroupChildrenFlag` — no new wiring needed there).

i18n for the shared sections lives under `…panelProperties.common.*`.

## `Frame/`

`Frame.tsx` = `FrameHeader` (its own `FrameHeaderMenu` with section/preset items +
`FrameHeaderButtons` = HTML-tag toggle + the shared component button, all passed into
`Common/PanelHeader`) → `Common/PositionSection` → `LayoutSection/` (flow, dimensions from
`Common/`, grid child span from `Common/`, min/max, alignment/gap/grid, padding, clip-content —
the auto-layout-specific rows, frame-only) → `Common/AppearanceSection`.

## `Rectangle/`

`Rectangle.tsx` = `RectangleHeader` (`Common/PanelHeader` with the label only + the shared
component button, no dropdown) → `Common/PositionSection` → a bare `UITools.Section` labelled
"Layout" holding `Common/ColumnDimensions` + `Common/ColumnGridChildSpan` → `Common/AppearanceSection`.
No auto-layout rows.

## Adding a panel for another node type

1. Route it in `PanelProperties.tsx`.
2. Compose it from `Common/` sections; move any section that a second panel now needs from the
   node folder into `Common/` (keep the i18n keys under `…panelProperties.common.*`) and widen its
   hooks' node-type gate to `isBoxSceneNode`.
3. Add `…panelProperties.<node>.*` i18n, a `<Node>.spec.tsx`, and an e2e in
   `e2e/design/panels/` if the panel drives canvas geometry (dimension/position edits do).
