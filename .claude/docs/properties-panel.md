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

i18n for the shared sections lives under `…panelProperties.common.*`.

## `Frame/`

`Frame.tsx` = `FrameHeader` (its own `FrameHeaderMenu` with section/preset items +
`FrameHeaderButtons` = HTML-tag toggle + the shared component button, all passed into
`Common/PanelHeader`) → `Common/PositionSection` → `LayoutSection/` (flow, dimensions from
`Common/`, min/max, alignment/gap/grid, padding, clip-content — the auto-layout-specific rows,
frame-only).

## `Rectangle/`

`Rectangle.tsx` = `RectangleHeader` (`Common/PanelHeader` with the label only + the shared
component button, no dropdown) → `Common/PositionSection` → a bare `UITools.Section` labelled
"Layout" holding just `Common/ColumnDimensions`. No auto-layout rows.

## Adding a panel for another node type

1. Route it in `PanelProperties.tsx`.
2. Compose it from `Common/` sections; move any section that a second panel now needs from the
   node folder into `Common/` (keep the i18n keys under `…panelProperties.common.*`) and widen its
   hooks' node-type gate to `isBoxSceneNode`.
3. Add `…panelProperties.<node>.*` i18n, a `<Node>.spec.tsx`, and an e2e in
   `e2e/design/panels/` if the panel drives canvas geometry (dimension/position edits do).
