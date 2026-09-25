# xigma — Roadmap 1.2.0

Continuation of [ROADMAP.1.1.0.md](./ROADMAP.1.1.0.md). This release is about working on many layers
at once: the right panel, the header buttons and the right-click menu all handle several selected
layers, not only one.

## Stage 1 — Several frames in the Frame panel

Selecting two or more frames shows the Frame panel instead of an empty one. A value every frame
shares is shown as is, a value that differs shows "Mixed", and any change applies to all frames in
one undo step.

- [x] size presets from the header apply to every selected frame
- [x] Select matching layers (⌥⌘A) adds same-named layers from other top-level frames

## Stage 2 — Position for several layers

X, Y and Rotation show "Mixed" when they differ. A typed value applies to each layer, and scrubbing
moves or turns each one by the same amount. Rotate 90° and Flip work on each layer separately.

## Stage 3 — Align, distribute and tidy up

The align buttons line up several layers against their shared box. Layers from different parents are
aligned separately within each parent. Distribute spreads them evenly, and Tidy up arranges them in a
neat row, column or grid with one shared gap.

## Stage 4 — Layout for several frames

Everything in the Layout section works across several frames: W/H with min/max, Fixed/Hug/Fill, the
aspect lock, flow, gap, padding, alignment, the grid area and clip content. When the frames use
different layouts, the rows that depend on the layout are hidden instead of showing wrong values.

## Stage 5 — Spacing between selected layers

The Layout section shows the gap between selected layers, horizontally and vertically, or "Mixed"
when they are uneven. Typing a value or scrubbing lays them out again with that gap. It also works
for the children of a single frame and for layers placed in a grid.

## Stage 6 — Appearance, Fill, Stroke and Effects for several layers

Opacity, corner radius, blend mode, fills, strokes and effects all work across the selection. When
the layers have different fills, strokes or effects, the section says "Click + to replace mixed
content", and + replaces them with one shared value.

## Stage 7 — Layout guide, Selection colors and Export for several layers

Layout guides can be edited on several frames at once. Selection colors collect colors from every
selected frame. Export saves every selected layer as its own file, packed into one zip.

## Stage 8 — Several rectangles, groups and booleans

Several rectangles show the Rectangle panel, so the Boolean button can join them all at once.
Several groups show the Group panel, and its header can turn each group into a frame, section, mask
or boolean. Boolean, Mask and Flatten work separately for each parent.

## Stage 9 — Mixed selections: "N selected"

A selection of different layer types shows one "N selected" panel. It keeps only the sections and
header buttons that every selected layer has.

## Stage 10 — Several sections and sections in a mix

Several sections show the Section panel, with Wrap in new section (⌘S) in the header. Resize to fit
fits each section to its own content in one step. A section inside another section shows its name
inside its top-left corner, above its content. A mix that includes a section keeps only what a
section has: no rotation, effects or component button.

- [x] Convert to frame is disabled when a selected section holds another section

## Stage 11 — Right-click menu for the whole selection

Right-clicking a layer that is part of the selection builds the menu from the whole selection. An
item shows only if it makes sense for every selected layer. Show/Hide and Lock/Unlock apply to all
selected layers at once.

- [x] Remove mask removes the mask from every selected mask layer at once

## Stage 12 — Slice

A slice marks an area of the page to export. It shows as a dashed outline and never hides what is
under it: a click goes straight through, so you pick it from the layers panel or with a marquee. It
always stays on the page and can't be put inside a frame, group or section. Exporting a slice saves
everything visible in its area, including the page background.

- [x] several slices export together, one file each
- [x] a rotated slice exports the upright area around it
- [x] hovering a slice in the layers panel highlights it on the canvas
- [x] layers snap to a slice's edges while dragging, and a slice snaps to them
- [x] a locked slice can still be picked in the layers panel but not dragged on the canvas
- [x] a hidden slice disappears from the canvas and isn't exported

## Stage 13 — Line and Arrow

A line has the full stroke settings: Position (Inside and Outside shift the stroke to one side),
dashed and custom strokes with dash caps, width profiles, and Dynamic and Brush strokes drawn along
the line. Arrowheads stay solid. A line is picked and measured by the stroke you see, not only by
its thin centre.

- [x] a line with an arrowhead is titled Arrow; several lines or arrows are titled "N selected"
- [x] Offset vector turns a line into a closed shape around it, with sharp or round corners and a
      live preview
- [x] the shape made by Offset keeps the line's stroke, also after you draw more onto it
- [x] a Union's own Dynamic and Brush stroke runs around every part of its shape

## Stage 14 — Ellipse

An ellipse has its own panel like a rectangle: Position, Layout, Appearance, Fill, Stroke, Effects
and Export. Arc in Appearance sets Start, Sweep and Ratio in one joined field, just like the handles
on the canvas. Fills, strokes and effects work the same as on a rectangle: several fills, gradients,
images, shadows, blur and noise.

- [x] Corner radius rounds the corners of a cut ellipse; it is off while the ellipse is not cut
- [x] the stroke follows the real shape, including a cut arc, a ring and rounded corners, with no
      gaps where the arc meets the cut
- [x] Position puts the stroke inside, in the centre or outside; dashed, profile, Dynamic and Brush
      strokes run around the shape
- [x] ellipses show Fill and Stroke when selected together with other layers
- [x] Flatten and Edit object keep the stroke of a rectangle or ellipse, including its Position
