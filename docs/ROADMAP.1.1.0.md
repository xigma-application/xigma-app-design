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

- [x] stroke alignment (inside / center / outside) is applied by the engine and to rendering, and now
      has a Position control in the Stroke section (Stage 29)

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
- [x] a dedicated Grid panel (opened from the Grid section, replaces the frame properties like the
      frame-template list does): one row per column and per row, each set to a fixed size / hug /
      share-the-space with a value; add a track, delete a track, and drag a track by its number to
      reorder it — the cells and any placed children move with it, and a move that would tear a
      spanning child apart snaps back
- [x] dragging those track sizes directly on the canvas — a track's grip drags to reorder it, its
      value pill edits in place (same fr/fixed/hug rules as the panel), and its chevron opens a
      dropdown for Fixed/Hug/Fill, all working across a multi-selection
- [x] letting a child span several cells, from its Column span / Row span fields (see Stage 26)
- [x] a "Toggle automatic positioning" button on the Flow row (Grid only) switches between
      auto-placing children in reading order and pinning them to manually-picked cells, matching
      Figma: dragging an already-placed child is blocked while automatic, dropping a brand-new one
      still slots it in by position without switching the frame to manual

## Stage 26 — Rectangle properties panel

Selecting a single rectangle now gives it its own right-panel view instead of a blank panel: the
name header with a "Create component" button, the same position and rotation controls a frame has,
and a width/height row. The parts a frame and a rectangle share (header, position, dimensions) were
pulled into one place so the next shape type can reuse them.

Anything sitting inside a grid also gets Column span / Row span fields under its size row.

- [x] the Column span / Row span fields stretch a child across cells — drag on the number or type
      it, and it stops as soon as it runs into the edge of the grid or another element; changing
      the grid's size drops any spanning child back to a single cell

## Stage 27 — Appearance section (Opacity, Corner radius, Hide/Show)

Rectangle and Frame panels now show an Appearance section. Opacity works like it does in a browser
— it's not just a see-through tint on that one shape, a parent's opacity dims everything inside it
too, compounding with each child's own opacity. Corner radius shows one shared value, or "Mixed"
when a shape's four corners don't match; a toggle expands it into four separate fields, one per
corner. A Hide/Show eye button sits in the section header next to a Blend mode button.

Once the four separate corner fields are open, a Corner smoothing button next to them opens a small
panel with a slider (plus an "iOS" marker for the smoothing level Apple uses) and a percentage field.
It now really reshapes the corners into the same rounder, softer "squircle" curve Figma and iOS use,
instead of a plain circular corner.

The Blend mode button's menu is now real too: picking a mode actually changes how the shape mixes
with whatever is behind it, the same way it works in Figma — a Frame or Group set to anything other
than the default "Pass through" also affects how its children blend with things outside the group,
not just the group itself. The button's icon fills in once a mode other than the default is picked,
and its tooltip changes from "Apply blend mode" to "Remove blend mode" to match — clicking it again
at that point clears the mode straight away instead of reopening the menu; opening the menu again
needs one more click. Hovering an option in the menu also now previews it live on the shape, the same
way Figma does, without actually committing anything until it's clicked. Each fill's own blend mode is
separate — see Stage 28.

The Paint tool's color picker now has its own blend mode picker too, right next to its close button —
pick one and the next face you paint uses it, actually blending against whatever's behind that face on
the canvas. It's a one-time choice per stroke: once you finish painting, the picker drops back to
Normal instead of staying set for the next face.

## Stage 28 — Fill picker

Every fill on a frame or rectangle now has a full picker, the same kind you get for a painted face,
with a tab for each way to fill a shape:

- [x] **Solid** — color map, hue and opacity sliders, hex/RGB/HSL/HSB/CSS values, an eyedropper, and
      the colors already used on the page
- [x] **Gradient** — linear, radial, angular and diamond, with editable stops and handles on the canvas
- [x] **Pattern** — repeat any other shape as the fill
- [x] **Image** and **Video** — pick a file, then Fill / Fit / Crop / Tile, rotate, and the usual
      exposure, contrast, saturation and similar adjustments
- [ ] **Shader** — the tab is there but empty for now

Every fill also has its own blend mode, next to the tabs. It stays when you switch between Solid,
Gradient, Image and so on, and each fill blends only with what's underneath it, so two fills on one
shape can mix in different ways.

On the Solid tab a contrast checker shows how readable the color is on its background, Figma-style.
It reads the parent frame (or the canvas when there is none), mixes in see-through backgrounds, and
gives the ratio with an AA / AAA badge. The color map draws a curve and dotted area where the contrast
fails; hover the badge to preview the closest passing color, click to jump there. When the background
or the fill has a blend mode, or the background is a gradient, image or similar, it says so instead of
guessing.

## Stage 29 — Stroke

The Stroke section works like Fill (several strokes, color / gradient / image, blend mode) and adds
the stroke-specific settings:

- [x] **Position** (inside / center / outside), **Weight**, and individual sides (top / right /
      bottom / left) with their own widths
- [x] **Advanced settings** panel with three tabs: **Basic** (solid / dashed / custom dashes, width
      profile, join, miter angle), **Dynamic** (wobbly line: Frequency, Wiggle, Smoothen) and **Brush**
      (pick a brush and its direction; scatter brushes add Gap, Wiggle, jitter and Rotation)
- [x] all of it is drawn on the canvas and undoable — for rectangles and frames for now
- [ ] the same modes for other shapes and vector paths

Below it sits an **Effects** section, with every effect type now drawn on the canvas except Shader:

- [x] add an effect from the plus menu, hide or delete it, and drag rows to reorder, like Fill and Stroke
      (the reorder handle only shows up once there's a second effect to reorder against — same for Fill
      and Stroke)
- [x] click an effect to edit its settings, or switch its type from the panel header
- [x] **Inner shadow** and **Drop shadow** — offset, blur, spread, color and opacity
- [x] **Layer blur** — blurs the shape itself, either evenly (Uniform) or fading across it in one
      direction, with draggable handles on the canvas (Progressive)
- [x] **Background blur** — blurs whatever sits behind the shape, showing through its own silhouette
- [x] **Noise** — a grain texture over the shape, in one color (Mono), two colors (Duo), or full color
      speckle (Multi), with size and density controls
- [x] **Texture** — a repeating fine texture pattern over the shape
- [x] **Glass** — a frosted-glass look: a light dial and angle, refraction, splay and frost sliders
      bend and blur whatever is behind the shape like real glass
- [ ] **Shader** is still not implemented — greyed out in the menu

## Stage 30 — Layout guide (Grid / Columns / Rows), Frame only

Figma-style layout guides, for measuring and lining things up — separate from the existing ruler
guides you drag out from the ruler. A Frame's right panel gets its own Layout guide section: add a
guide from the plus button (defaults to Grid), each row shows a 24x24 icon that opens its full
settings panel plus a small dropdown next to it to switch its type (Grid / Columns / Rows) without
opening that panel, an eye to hide/show it, and a minus to delete it — rows can be dragged to
reorder once there's more than one, same rule as Fill/Stroke/Effects.

- [x] **Grid** — evenly spaced lines every N pixels, in a color and opacity you pick
- [x] **Columns** / **Rows** — a set number of evenly spaced bands, with alignment (stretch / start /
      end / center), a fixed width or height, margin and gutter
- [x] drawn on the canvas, clipped so a guide never spills outside its own frame
- [x] a global on/off toggle for every guide at once — Shift+G, or from the View and Zoom menus

## Stage 31 — Selection colors, Frame only

A frame's right panel now lists every color used anywhere inside it — its own fill/stroke plus every
child's, however deeply nested — as one deduplicated palette, Figma-style. A fill and a stroke of the
same color count as one entry, and so do two identical fills, as long as they share a blend mode; the
same color with a different blend mode gets its own row. Editing a row's color, opacity or blend mode
updates every fill and stroke that shares it, in a single undo step, and rows automatically merge or
split apart as an edit makes them match (or stop matching) another. Each row can only be changed to a
solid, gradient or shader color, never an image, video or pattern, and has no contrast checker.

## Stage 32 — Export, Frame and Rectangle

A Frame or Rectangle's right panel gets an Export section: add a row from the plus button, each one
picks a scale (0.5x–4x, or a fixed 512px width/height) and a format, plus a settings popover for a
filename suffix and a few more options. Rows can be dragged to reorder or clicked to select, same as
Fill/Stroke/Effects. Below the rows sits an Export button and a live preview thumbnail of the shape.

- [x] PNG and JPEG rows actually export, at the row's own scale; exporting more than one row at once
      downloads a zip instead, with every file named uniquely
- [x] a small "Exporting..." message shows above the toolbar while a download is being prepared
- [x] "Ignore overlapping layers" actually changes the export: on (default) it exports only the
      shape's own content, off includes whatever else on the canvas visually overlaps it too
- [x] "Image resampling" (Basic/Detailed) actually changes how any image or video fill inside the
      export is filtered when scaled down — Detailed looks noticeably sharper than a plain resize
- [x] Color profile tags the exported file: Display P3 files look more vivid (same as Figma's
      Display P3 export, which also keeps the original color numbers and just labels them P3),
      sRGB is the plain normal export
- [x] JPEG rows get a Quality setting (High/Medium/Low) in the settings popover, shown only for JPEG
- [x] PDF export (first version): plain text stays real, selectable text; everything else is drawn
      as an image layer in the right stacking order
- [x] PDF: rectangles and frames with plain colors are real vector shapes
- [x] PDF: ellipses, polygons and stars with plain colors are real vector shapes
- [x] Fixed a bug where real PDF text was invisible
- [x] PDF rows also get the Quality setting: when the whole export is one image (nothing vector or
      real text on the page), it's compressed as JPEG at that quality instead of always lossless
- [x] PDF: straight lines (including arrow endpoints) with plain colors are real vector shapes
- [x] PDF: pen-tool shapes with plain colors (fill and uniform stroke) are real vector paths
- [x] PDF: linear and radial gradients (fully opaque stops) are real native shadings
- [x] PDF: angular and diamond gradients (fully opaque stops) are real native shadings too
- [x] PDF: gradients with translucent stops are also real native shadings, using a soft mask
- [x] PDF: text on a path exports as real vector curves instead of an image
- [x] SVG export (first version): rectangles, frames, ellipses, polygons, stars and lines with plain
      colors export as real `<path>` vector shapes; everything else (gradients, images/video, text,
      pen-tool shapes) is drawn as an embedded raster image in the right stacking order
- [x] SVG: linear and radial gradients on Frame/Rectangle fills and strokes export as real native
      `<linearGradient>`/`<radialGradient>` (angular and diamond gradients still fall back to a raster
      image, since SVG has no native conic/Manhattan gradient primitive)
- [x] SVG: pen-tool shapes (fill, including linear/radial gradient faces, uniform stroke and round
      caps) export as real vector paths
- [x] SVG: plain text exports as real, selectable `<text>`; text on a path exports as real vector
      curves instead of an image
- [x] SVG: images and videos (fills and standalone layers) embed as real `<image>` elements instead of
      being flattened into a raster snapshot — covers all four fill modes (fill, fit, crop, tile, the
      last via a repeating `<pattern>`); an image with color adjustments still falls back to raster,
      since SVG has no matching filter

## Related

[[canvas-rendering-pipeline]] — the render loop this app's tools plug into.

[[text-flatten-and-outline]] — full pipeline behind Stage 12.

[[masks]] — full pipeline behind Stage 13.

[[auto-layout]] — full pipeline behind Stages 20-24.
