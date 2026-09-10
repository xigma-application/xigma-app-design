# xigma — Roadmap 1.1.0

Continuation of [ROADMAP.1.0.0.md](./ROADMAP.1.0.0.md) — small, separate features, checked off as
they land. Kept apart from the big performance stage in [ROADMAP.2.0.0.md](./ROADMAP.2.0.0.md).

## Stage 1 — Color Sampler (eyedropper)

A loupe follows the cursor with a zoomed pixel preview; click to pick the color under it. Reads the
real rendered color, not a screenshot approximation. Closes on Escape or after picking.

## Stage 2 — Enter: text editing / shape → vector

Enter on a text node starts editing it. Enter on a Rectangle/Ellipse/Line/Arrow/Polygon/Star turns
it into an editable vector shape and opens Vector Edit Mode right away, in one undo step.
(Arrowheads are lost on conversion — no vector equivalent.)

## Stage 3 — Paint: custom color and a drag brush

Paint now uses a real color you pick, instead of a random one. Dragging paints (or removes) every
face the brush crosses in one stroke, instead of one click per face. Write-up:
`.claude/docs/vector-network.md` §67-69.

- [x] color picker on the tool, survives Erase/Cut/Shape Builder
- [x] drag paints/removes multiple faces at once
- [x] the picker's opacity slider actually does something now — a painted face can be see-through

## Stage 4 — Selection size label

A blue `W x H` badge sits just outside the selection, following its edge as it rotates. Hidden in
Vector Edit Mode.

## Stage 5 — Shape contact guides

When a shape sits flush against a neighbor, a red line marks the touching edge — while dragging,
resizing, or Alt-hovering. Figma-style. Now also works for diagonal and same-side placements.

## Stage 6 — Shape alignment snap on move

Dragging a shape snaps its edges/center onto other shapes' edges/centers.

## Stage 7 — Shape alignment snap on resize

Same snapping, now while resizing.

## Stage 8 — Shape alignment snap on draw

Same snapping, now while drawing a brand-new shape.

## Stage 9 — Snap performance fix

Snapping was rescanning every shape on the page on every mouse move during a drag/resize/draw.
Now it scans once per gesture instead.

## Stage 10 — Single-purpose app, no more routing

The app dropped client-side routing — it lives on its own subdomain with nothing else to route to.
Removed `react-router` and the old starter-template pages.

## Stage 11 — Text on Path: attach to an existing shape

Text on Path can now attach to an existing vector or shape instead of always drawing a fresh curve
— click where you want the text to start. The attached path now moves, rotates, resizes, copies,
and pastes as one unit with its text, and shows its own dashed outline only when relevant.

## Stage 12 — Flatten and Outline as stroke for text

Two new destructive text commands: Flatten turns a whole text node into one vector shape; Outline
as stroke keeps every letter as its own selectable vector instead. Full write-up:
`.claude/docs/text-flatten-and-outline.md`. (Performance follow-up tracked in ROADMAP.2.0.0.md.)

## Stage 13 — Masks (Figma-style)

A layer can now clip the layers above it in its group to its own painted shape — "Use as mask"
(⌃⌘M). Works with every layer type, including strokes. Full write-up: `.claude/docs/masks.md`.

- [ ] follow-ups: broader e2e coverage, mask hit-region clipping, multiple masks per group, other
      mask blend modes

## Stage 14 — Figma-style distance measurement (Alt+hover)

Select something, hold Alt, hover another shape — orange dashed lines with the distance in px show
the gap, like Figma. Now also works inside Vector Edit Mode: select a point, segment, or a few
points at once, then Alt-hover another point, segment, or whole face to measure against it.

## Stage 15 — Smart Selection

Select two or more shapes that form a row, column, or grid, and the canvas recognizes it: gap
handles let you drag the spacing between elements (hold Shift to snap to the nearest 10), and a
small handle on each element lets you drag it onto another to swap places, with everything else
reflowing live. Works with uneven grids too — some cells can be empty, and dragging an element
into an empty cell just relocates it there.

If a selection is close to but not quite a clean row/column/grid, a small icon appears in the
corner of the selection while hovering it. Clicking it fixes things automatically: it evens out
uneven gaps, or folds a stray element into the group (dropping it into a grid's empty cell,
extending the grid, or slotting it into the row/column wherever it fits best) — resizing it to
match if needed.

## Stage 16 — Scrollbar fixes

Dragging the canvas scrollbar could fling the view wildly off, or leave the thumb stuck shrinking
partway to the edge instead of reaching it. Both fixed — dragging now pans smoothly and stops
exactly at the content's edge, with the thumb staying a steady size the whole time.

## Stage 17 — Right panel shell

A docked, resizable panel on the right, matching the left panel's minimize/hide behavior. Its
header holds the account menu, Present/Preview/Share, view tabs, and zoom controls, each with a
real tooltip.

## Stage 18 — Nothing-selected panel

With nothing selected, the right panel shows the page's own background — a color swatch, hex and
opacity editing, a checkerboard behind transparency — with full undo/redo, so a whole drag (in the
picker or the opacity slider) becomes one undo step. Styles, Export, and MCP sections sit below it,
matching Figma's layout, though their "+" buttons don't do anything yet.

## Stage 19 — Frame properties panel

Selecting a frame swaps the right panel into a dedicated view: position (X/Y), rotation with flip
buttons, a Layout section (flow direction, width/height with a lock-aspect-ratio toggle that now
also holds while dragging a resize handle on the canvas — not just typing into the fields — and
shows the same diagonal guide line Shift-resizing does), a "Clip content" checkbox, and "Resize to
fit" (its own button, an Object menu entry, and ⌥⇧⌘R) to snap the frame around its children.

- [ ] the alignment row's buttons show and tooltip correctly but don't align anything yet

## Stage 20 — Auto layout: flow, alignment, wrap

A frame can arrange its children for you. Pick a flow — horizontal or vertical — and the children line
up in a row or column with a shared gap. A small 3×3 picker sets where that block sits inside the
frame and how the children line up across the flow. Turn on Wrap and a horizontal row breaks onto a
new line when it runs out of width, each line aligned on its own. Still works when the frame itself is
rotated. Full write-up: `.claude/docs/auto-layout.md`.

## Stage 21 — Auto layout: Hug / Fixed / Fill and Min/Max

Each side of a frame — and of every child — can hug its contents, stay a fixed size, or fill the space
its parent gives it. Several "fill" children share the leftover evenly. Optional Min and Max limits
cap how far anything grows or shrinks, handing the slack back to the siblings that still have room.

## Stage 22 — Auto layout: padding and gap

Padding can be set per side, either in the panel or by dragging handles on the canvas, with a
click-to-type value bubble and guide lines while you do it. The gap between children can be a fixed
number — also draggable on the canvas, snapping to 10 with Shift, and allowed to go negative so
children overlap — or switched to Auto, which spreads the leftover space out evenly instead.

## Stage 23 — Auto layout: drag to reorder, drag to drop in

Drag a child inside its frame and a blue marker shows where it will land; let go and it reorders in
one step. Drag a shape in from outside and it drops into the marked spot instead of jumping around
mid-drag. Handles wrapped rows, rotated frames, and dragging several selected children at once. A
child can also be told to ignore auto layout and sit wherever you put it.

## Stage 24 — Auto layout settings popover

A gear button on the alignment row opens the less-common per-frame settings: canvas stacking order,
aligning text children by their baseline, and how Auto gap spreads children (between / around /
evenly). It also holds the Layout version switch — Figma split its auto layout into "legacy" and
"updated" behaviour in 2026, and this matches that: under "updated" a frame never shrinks below its
padding, an auto gap never overlaps children, a lone spaced child sits at the start, and a shape's
stroke only affects layout when it's aligned to the inside.

- [ ] stroke alignment (inside / center / outside) is applied by the engine and to rendering, but has
      no panel control yet — it can only be set in code

## Stage 25 — Auto layout: grid flow

A third arrangement next to horizontal and vertical: a frame can lay its children out on a grid of
rows and columns. Pick the grid from the same Flow control; children fill it left to right, top to
bottom, and each row or column can be a fixed size, hug its contents, or share the leftover space.
Row and column gaps and padding work as they already do. Rotating the frame still works. Full
write-up: `.claude/docs/auto-layout.md` §13.

- [x] the layout maths
- [x] the right-panel Grid section — a preview tile that opens a popup with column and row number
      fields and a click-to-pick size grid, plus the row and column gap fields
- [x] selecting a grid frame outlines its cells on the canvas, and they reflow as the row/column
      count changes
- [x] dragging an element onto the grid highlights the cell under the cursor (and the element goes
      translucent); dropping snaps it into that cell at the cell's size, growing the grid with extra
      rows if you drop past the end. A child that spans several cells highlights its whole block of
      slots while it's dragged, skipping any that fall outside the grid or that another element
      already holds
- [ ] setting a row or column to a fixed size / hug / share-the-space, and dragging those sizes on
      the canvas — this is the last part
- [x] letting a child span several cells, from its Column span / Row span fields (see Stage 26)
- [ ] later: reordering the cells with the keyboard

## Stage 26 — Rectangle properties panel

Selecting a single rectangle now gives it its own right-panel view instead of a blank panel: the
name header with a "Create component" button, the same position and rotation controls a frame has,
and a width/height row. The parts a frame and a rectangle share (header, position, dimensions) were
pulled into one place so the next shape type can reuse them.

Anything sitting inside a grid also gets Column span / Row span fields under its size row.

- [x] the Column span / Row span fields stretch a child across cells — drag on the number or type
      it, and it stops as soon as it runs into the edge of the grid or another element; changing
      the grid's size drops any spanning child back to a single cell

## Related

[[canvas-rendering-pipeline]] — the render loop this app's tools plug into.

[[text-flatten-and-outline]] — full pipeline behind Stage 12.

[[masks]] — full pipeline behind Stage 13.

[[auto-layout]] — full pipeline behind Stages 20-24.
