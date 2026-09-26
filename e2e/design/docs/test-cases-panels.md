# Panels — test case catalog

Test cases for the Layers panel and canvas name-label editing that live in `e2e/design/panels/`.

## Frame name label

Every `NodeType.frame` node renders its `name` as a small always-on WebGL text label just above its
top-left corner (`drawFrameNameLabels`), colored `FRAME_NAME_LABEL_SELECTED_FILL` when selected or
`FRAME_NAME_LABEL_FILL` otherwise. Double-clicking the label (default/move tool) swaps it for a real
`CanvasNameLabelInput` (`FrameNameLabelEditOverlay`); committing dispatches the same `updateNode`
action the Layers panel's own rename input uses, so the two stay in sync in both directions — the
one thing genuinely worth an e2e test here, since it's an integration between the WebGL canvas and
the DOM Layers tree that unit tests only exercise one side of at a time (`useFrameNameLabelEditor`
mocks the hit-test util; `TreeItem`'s rename spec never touches the canvas).

| #   | Scenario                                                                                                                                                           | Unit |                         E2E                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :-------------------------------------------------: |
| 1   | Renaming a frame via its canvas label updates the Layers panel row                                                                                                 |  ✅  |            ✅ `frame-name-label.spec.ts`            |
| 2   | Renaming a frame from the Layers panel updates its canvas label                                                                                                    |  —   |            ✅ `frame-name-label.spec.ts`            |
| 3   | Pressing Escape while editing the canvas label leaves the name unchanged                                                                                           |  ✅  |            ✅ `frame-name-label.spec.ts`            |
| 4   | Ctrl+Z after a canvas-label rename reverts the name (shared `updateNode` history)                                                                                  |  —   |            ✅ `frame-name-label.spec.ts`            |
| 5   | New frames are auto-numbered "Frame 1", "Frame 2", ... off existing frames on the page                                                                             |  ✅  | — (covered precisely by `getNextFrameName.spec.ts`) |
| 6   | The would-be name label is already visible above the frame while it is still being dragged out (`drawDraftFrameNameLabel`), not just after the pointer is released |  ✅  |            ✅ `frame-name-label.spec.ts`            |
| 7   | Clicking a frame's canvas label selects it, landing on pixel-identical output to clicking its body (`getNodeAtPoint`/`isPointInNodeNameLabel`)                     |  ✅  |            ✅ `frame-name-label.spec.ts`            |
| 8   | Hovering a frame's canvas label shows the same hover highlight as hovering its body                                                                                |  ✅  |            ✅ `frame-name-label.spec.ts`            |

## Section name label

Sections get the same floating name label as frames — same auto-numbering
(`getNextSectionName`), same double-click-to-rename via `CanvasNameLabelInput`
(`SectionNameLabelEditOverlay`), same click/hover hit-area (`isPointInNodeNameLabel`) — but
rendered as a filled, rounded badge (`drawSectionNameLabel`, `SECTION_NAME_LABEL_FILL`) instead of
plain text, matching the selection size label's visual language rather than the frame label's. The
badge's colors never change with selection (unlike the frame label's grey/blue text swap), since a
section can't be rotated and its edit input therefore never needs the frame label's angle-tracking
logic either.

| #   | Scenario                                                                                                                                               | Unit |                          E2E                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :---------------------------------------------------: |
| 1   | Renaming a section via its canvas label updates the Layers panel row                                                                                   |  ✅  |            ✅ `section-name-label.spec.ts`            |
| 2   | Renaming a section from the Layers panel updates its canvas label                                                                                      |  —   |            ✅ `section-name-label.spec.ts`            |
| 3   | Pressing Escape while editing the canvas label leaves the name unchanged                                                                               |  ✅  |            ✅ `section-name-label.spec.ts`            |
| 4   | Ctrl+Z after a canvas-label rename reverts the name (shared `updateNode` history)                                                                      |  —   |            ✅ `section-name-label.spec.ts`            |
| 5   | New sections are auto-numbered "Section 1", "Section 2", ... off existing sections on the page                                                         |  ✅  | — (covered precisely by `getNextSectionName.spec.ts`) |
| 6   | The would-be name badge is already visible above the section while it is still being dragged out (`drawDraftSectionNameLabel`), not just after release |  ✅  |            ✅ `section-name-label.spec.ts`            |
| 7   | Clicking a section's canvas label selects it, landing on pixel-identical output to clicking its body                                                   |  ✅  |            ✅ `section-name-label.spec.ts`            |
| 8   | Hovering a section's canvas label shows the same hover highlight as hovering its body                                                                  |  ✅  |            ✅ `section-name-label.spec.ts`            |

## Rectangle properties panel

Selecting a single rectangle routes `PanelProperties.tsx` to `Rectangle/`, which reuses the shared
`Common/PanelHeader`, `Common/PositionSection` and `Common/ColumnDimensions` (the same sections the
Frame panel uses — their hooks gate on `isBoxSceneNode`, not `type === frame`). The header is the
label plus the "Create component" button only, no element-type dropdown; the Layout section holds
the width/height row plus, when the selection sits inside a grid frame, a Column span / Row span
row (`Common/ColumnGridChildSpan`, display-only for now), none of the auto-layout rows.

| #   | Scenario                                                                                              | Unit |                                                    E2E                                                    |
| --- | ----------------------------------------------------------------------------------------------------- | :--: | :-------------------------------------------------------------------------------------------------------: |
| 1   | Selecting a rectangle shows the Rectangle panel with a Dimensions row and no auto-layout rows         |  ✅  |                                       ✅ `rectangle-panel.spec.ts`                                        |
| 2   | Editing the width field in the Rectangle panel resizes the shape on the canvas                        |  —   |                                       ✅ `rectangle-panel.spec.ts`                                        |
| 3   | The Column span / Row span row shows only while the selection is a child of a `LayoutMode.grid` frame |  ✅  | — (pure conditional render, no canvas interaction; `useColumnGridChildSpan.spec.tsx` covers every branch) |

## Position section — Alignment on a frame with children

A top-level free-form frame with children enables the Alignment buttons and aligns each child on its
own against the frame's edges, writing that child's constraint too, in one undo step. A nested frame
still aligns itself inside its parent. The Distribute menu (Tidy up, Distribute vertical/horizontal
spacing) shows next to Alignment for any free-form frame with children. Distribute works on the
children of a top-level free-form frame with 3+ children and on multi-selections; Tidy up works on
multi-selections only.

| #   | Scenario                                                                                                                                                                                                                                                                                                                             | Unit |                                                                    E2E                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :----------------------------------------------------------------------------------------------------------------------------------------: |
| 551 | Align right on a top-level free-form frame moves every child to the frame's right edge; Ctrl+Z undoes it all                                                                                                                                                                                                                         |  ✅  |                                                     ✅ `frame-align-children.spec.ts`                                                      |
| 552 | The Distribute menu shows only once the free-form frame has children and lists its three items                                                                                                                                                                                                                                       |  ✅  |                                                     ✅ `frame-align-children.spec.ts`                                                      |
| 553 | A nested free-form frame with children aligns itself inside its parent, not its children                                                                                                                                                                                                                                             |  ✅  |            — (same button click as #551, only the target differs; `useColumnAlignment.spec.tsx` asserts both positions exactly)            |
| 554 | Distribute horizontal spacing on a top-level free-form frame evens out the gaps between its three children, keeping the outermost ones                                                                                                                                                                                               |  ✅  |                                                     ✅ `frame-align-children.spec.ts`                                                      |
| 555 | With two frames selected, Align left moves both to the selection's left edge; their children keep their place inside                                                                                                                                                                                                                 |  ✅  |                                                     ✅ `frame-align-children.spec.ts`                                                      |
| 556 | A multi-selection spanning several parents aligns each parent's group only against itself; auto-layout children stay put                                                                                                                                                                                                             |  ✅  |            — (pure per-group arithmetic on the same button click as #555; `useColumnAlignment.spec.tsx` asserts every position)            |
| 557 | Tidy up on a multi-selected row of frames evens out their gaps to the most common one                                                                                                                                                                                                                                                |  ✅  |                                                     ✅ `frame-align-children.spec.ts`                                                      |
| 558 | Tidy up picks row / column / grid from the layout (and the matching icon); grid packs rows and columns from the top-left corner                                                                                                                                                                                                      |  ✅  |                        — (pure geometry; `tidyUp/test/*.spec.ts` cover every layout, #557 covers the browser flow)                         |
| 559 | Aligning a single frame's children moves a group child together with its members                                                                                                                                                                                                                                                     |  ✅  |                        — (same button click as #551; `useColumnAlignment.spec.tsx` asserts the members' positions)                         |
| 560 | With two frames selected, a size preset from the Frame header menu resizes both, one undo step                                                                                                                                                                                                                                       |  ✅  |                                                     ✅ `frame-align-children.spec.ts`                                                      |
| 567 | With two frames selected, X shows Mixed and a typed X moves both frames to it                                                                                                                                                                                                                                                        |  ✅  |                                                        ✅ `multi-position.spec.ts`                                                         |
| 568 | With two frames selected, a typed rotation turns both                                                                                                                                                                                                                                                                                |  ✅  |                                                        ✅ `multi-position.spec.ts`                                                         |
| 569 | With two frames selected, Flip flips each frame on its own and swaps their places                                                                                                                                                                                                                                                    |  ✅  |                                                        ✅ `multi-position.spec.ts`                                                         |
| 570 | Scrubbing X/Y or rotation with several layers moves/turns each by the same delta from its start, the field stays Mixed                                                                                                                                                                                                               |  ✅  |       — (a scrub is a synthetic drag on the adornment; `useColumnPosition.spec.tsx`/`useColumnRotation.spec.tsx` assert every value)       |
| 571 | With two frames selected, W shows Mixed and a typed width resizes both                                                                                                                                                                                                                                                               |  ✅  |                                                        ✅ `multi-position.spec.ts`                                                         |
| 572 | With several frames selected, a typed W/H keeps each frame's aspect-ratio lock and clamps to its own min/max; min/max rows show Mixed and set every frame, a bound only some frames have is disabled                                                                                                                                 |  ✅  | — (per-frame arithmetic on the same field as #571; `useColumnDimensions.spec.tsx`/`useColumnMinMaxDimensions.spec.tsx` assert every frame) |
| 573 | With two auto-layout frames selected, horizontal padding shows Mixed, a typed value sets it on both and the field shows it, Ctrl+Z restores both in one step                                                                                                                                                                         |  ✅  |                                                         ✅ `multi-layout.spec.ts`                                                          |
| 574 | With two grid frames selected, the grid area shows Mixed without Open grid settings, a picked cell gives both the grid grown to fit the frame with the most children, one undo step                                                                                                                                                  |  ✅  |                                                         ✅ `multi-layout.spec.ts`                                                          |
| 575 | With two frames selected, differing opacity, blend mode and uneven corners show Mixed (blend row with Mixed, individual corner fields open), a typed opacity sets both                                                                                                                                                               |  ✅  |                                                       ✅ `appearance-panel.spec.ts`                                                        |
| 576 | With two frames selected, differing fills (count or any setting) show the mixed content hint and + replaces both with one shared fill                                                                                                                                                                                                |  ✅  |                                                         ✅ `fill-section.spec.ts`                                                          |
| 577 | With two frames selected, a shared image fill disables Crop and Tile in the fill mode menu                                                                                                                                                                                                                                           |  ✅  |                                                         ✅ `fill-section.spec.ts`                                                          |
| 578 | Deleting the source of a pattern used as a stroke freezes that stroke like a fill                                                                                                                                                                                                                                                    |  ✅  |                                                         ✅ `fill-section.spec.ts`                                                          |
| 579 | Picking a pattern source with several layers selected sets it on each of them in one step                                                                                                                                                                                                                                            |  ✅  |                     — (same pick flow as the single-layer e2e; `handlePatternSourcePick.spec.ts` asserts every target)                     |
| 580 | The same image file uploaded separately into two frames reuses one object URL, so both selected show one shared fill                                                                                                                                                                                                                 |  ✅  |                                                         ✅ `fill-section.spec.ts`                                                          |
| 581 | Picking the same image file twice with the Image/video tool places two layers that share one image source (videos reuse the extracted frame)                                                                                                                                                                                         |  ✅  |                                                         ✅ `create-media.spec.ts`                                                          |
| 582 | With two frames selected, differing strokes show the mixed content hint above the stroke settings row and + gives both one shared stroke                                                                                                                                                                                             |  ✅  |                                                        ✅ `stroke-section.spec.ts`                                                         |
| 583 | With two frames selected, Stroke settings shows a mixed style as Mixed and only the fields every layer has (Dash/Gap hidden for Solid + Dashed, Dash cap kept for Dashed + Custom); picking a style sets all                                                                                                                         |  ✅  |                                                        ✅ `stroke-section.spec.ts`                                                         |
| 584 | With several layers selected, differing Dash, Gap, Dashes, Join, Miter angle and Width profile show Mixed or no selection, a typed value sets all, a scrub shifts each by the same delta                                                                                                                                             |  ✅  |       — (same fields as #583; `useStrokeSettingsBasicTab.spec.tsx`/`useStrokeSettingsWidthProfileField.spec.tsx` assert every node)        |
| 585 | With two frames selected, a typed stroke weight is set on both (was: only the first); Position, sides and side weights show Mixed and apply to all                                                                                                                                                                                   |  ✅  |                                                        ✅ `stroke-section.spec.ts`                                                         |
| 586 | With several layers selected, mixed stroke modes select no tab and a clicked tab sets all; Dynamic fields show Mixed; a mixed brush shows Mixed in the trigger, hides scatter fields and direction unless every layer has them, and preview/revert restores each layer its own brush                                                 |  ✅  |   — (`useStrokeSettingsPanel.spec.tsx`, `useStrokeSettingsDynamicTab.spec.tsx`, `useStrokeSettingsBrushTab.spec.tsx` assert every node)    |
| 587 | With a basic and a dynamic/brush stroke selected, the stroke settings button and the position dropdown are disabled (Mixed only when the effective positions differ) and the individual sides menu is hidden                                                                                                                         |  ✅  |                                                        ✅ `stroke-section.spec.ts`                                                         |
| 588 | With several basic strokes selected, a single-side stroke on any layer shows a locked Mixed in the sides menu; All plus Custom shows the four side fields (Mixed per differing side) and a side edit turns All layers into Custom                                                                                                    |  ✅  |                                                        ✅ `stroke-section.spec.ts`                                                         |
| 589 | With two frames selected, effects with the same types show one shared row (differing fields Mixed, a typed value set on all); different types show the mixed content hint                                                                                                                                                            |  ✅  |                                                        ✅ `effects-section.spec.ts`                                                        |
| 590 | With several layers selected, mixed blur modes or noise types leave the tab unselected and show only the fields every variant has; colors, glass fields and blend mode show Mixed; a scrub shifts each by the same delta                                                                                                             |  ✅  |           — (`getSharedEffectPanelLayout.spec.ts`, `useEffectsSection.spec.tsx`, `effectsMultiUtils.spec.ts` assert every layer)           |
| 591 | With two frames selected, Selection colors lists the colors of every selected frame and its children (was: only the first frame), and a change applies to all of them                                                                                                                                                                |  ✅  |                                                       ✅ `selection-colors.spec.ts`                                                        |
| 592 | With two frames selected, layout guides of the same types show one shared row (differing fields Mixed, a typed value set on all, width/height disabled when any guide stretches); different types show the mixed content hint and + replaces them                                                                                    |  ✅  |                                                     ✅ `layout-guide-section.spec.ts`                                                      |
| 593 | With two frames selected, the Export button reads Export 2 layers and downloads one zip with a file per layer (repeated names numbered)                                                                                                                                                                                              |  ✅  |                                                            ✅ `export.spec.ts`                                                             |
| 594 | The Boolean operations button wraps the selected shapes in a Union styled like the top layer; a shape dropped on the Union row joins it and picking Subtract from the menu switches the operation, header label and layer icon                                                                                                       |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 595 | A frame dropped on a boolean row stays outside it (only shapes, vectors and booleans can join; text, groups, masks, frames and sections cannot)                                                                                                                                                                                      |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 596 | A boolean draws one outline and fill from its children's geometry: overlapping or edge-aligned shapes merge, disjoint shapes keep separate outlines, shapes inside another drop out of a union and cut a hole in a subtract, nested booleans act as one shape                                                                        |  ✅  |           — (`computeBooleanVectorNode.spec.ts`, `getBooleanVectorNode.spec.ts`; pixel-exact outlines are not comparable in e2e)           |
| 597 | Wrapping a rectangle in a Union keeps its fill color on the canvas (was: each face drawn in a placeholder color derived from its random key, changing on every recompute)                                                                                                                                                            |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 598 | Flatten from the Boolean menu (or ⌥⇧F) turns a boolean into one vector of its result, drops its children and keeps its look                                                                                                                                                                                                          |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 599 | Flatten with several layers selected merges them into one vector at the top layer, styled like it, keeping every edge and filling every area that was filled                                                                                                                                                                         |  ✅  |                                                            ✅ `flatten.spec.ts`                                                            |
| 600 | The Edit object button in the Rectangle header does the same as ↵: turns the rectangle into a vector and starts editing its points                                                                                                                                                                                                   |  ✅  |                                                        ✅ `rectangle-panel.spec.ts`                                                        |
| 601 | Dragging, resizing or rotating a boolean with a vector inside moves the vector part live (was: the vector drew from a drag snapshot the boolean couldn't see, so its part stayed put until release)                                                                                                                                  |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 602 | A selected child of a boolean can be grabbed anywhere within its frame and moves on its own (was: grabbing an unfilled vector off its line dragged the whole Union)                                                                                                                                                                  |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 603 | An unfilled vector (or a line) inside a boolean joins it as the shape of its own stroke, filled with the boolean's fill like Figma (its own stroke settings stay on the node, the boolean's stroke only outlines that shape)                                                                                                         |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 604 | Several selected rectangles show the Rectangle panel (was: empty panel), and its Boolean button wraps them all in one Union                                                                                                                                                                                                          |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 626 | A line drawn without a stroke width joins a Union with a rectangle as its 1px stroke shape and stays visible (was: its outline got width 0, so the line vanished from the Union)                                                                                                                                                     |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 627 | Dragging a Union with a line inside moves the line part live                                                                                                                                                                                                                                                                         |  —   |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 628 | A selected line inside a Union can be grabbed on its stroke and moves on its own, leaving the rectangle in place                                                                                                                                                                                                                     |  —   |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 629 | An arrow joined into a Union with a rectangle keeps its arrowhead (was: only the line body joined, the head was cut off)                                                                                                                                                                                                             |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 636 | A diagonal line joined into a Union is drawn along its own direction (was: its stroke shape was turned a second time by the line's rotation)                                                                                                                                                                                         |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 637 | A thick stroke on a Union of thin lines is drawn as a solid band (was: the inner edge of the stroke ring folded over the thin shape and the even-odd fill cut it hollow with a line through it)                                                                                                                                      |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 630 | A boolean draws any stroke paint (gradients, image, video, pattern, several stacked) as a ring around its shape, like its fill (was: only a solid stroke was drawn, anything else showed no stroke)                                                                                                                                  |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 631 | Flattening a boolean with a gradient stroke keeps a stroke in the gradient's first stop color (was: the stroke was dropped; vectors hold only one stroke color until stroke paints come to vectors)                                                                                                                                  |  ✅  |                                                      ✅ `boolean-operations.spec.ts`                                                       |
| 605 | With several layers selected, the Layout section shows Spacing (horizontal and vertical gap between neighbours, Mixed when uneven); a typed value lays them out from the first one with that gap in one undo step                                                                                                                    |  ✅  |                                                         ✅ `multi-layout.spec.ts`                                                          |
| 606 | Spacing on a grid selection measures the gap between columns and rows (layers overlapping on that axis form one column/row) and a typed value moves each column/row as a whole (was: one chain by position showed Mixed for a perfect grid)                                                                                          |  ✅  |                                                         ✅ `multi-layout.spec.ts`                                                          |
| 607 | A selection of different panel types (frame, rectangle, boolean) shows the "N selected" panel with the sections every type has; its header has matching layers, component options and wrap in section (same parent only) (was: empty panel)                                                                                          |  ✅  |                                                          ✅ `mixed-panel.spec.ts`                                                          |
| 608 | Several selected rectangles swap Create component and Edit object in the header for a More actions menu (component actions, Edit objects, Wrap in new section); Edit objects turns them all into vectors and starts editing                                                                                                          |  ✅  |                                                        ✅ `rectangle-panel.spec.ts`                                                        |
| 609 | Several selected frames show the html tag, a Component split button (Create component / multiple components / component set), Mask and Wrap in new section in the header                                                                                                                                                             |  ✅  |                                                          ✅ `mixed-panel.spec.ts`                                                          |
| 610 | Drop shadow, inner shadow, noise and texture on a boolean follow its real shape (was: shadows and noise were drawn only for rectangles and frames, texture edges were covered by the untouched shape)                                                                                                                                |  ✅  |                                                        ✅ `boolean-effects.spec.ts`                                                        |
| 611 | A pattern fill on a boolean is drawn inside its shape (was: the boolean's fill skipped pattern tiles), and glass refracts along the boolean's shape instead of its bounding box                                                                                                                                                      |  ✅  |                                                        ✅ `boolean-effects.spec.ts`                                                        |
| 612 | Frames from different parents keep only matching layers and the component split button; rectangles from different parents hide Edit objects and Wrap in new section; Create component (and component set) shows "Could not create component and instances from non-matching selection" above the toolbar                             |  ✅  |                                                          ✅ `mixed-panel.spec.ts`                                                          |
| 613 | The header Mask button uses the selection as a mask like ⌃⌘M; Boolean, Mask and Flatten on layers from different parents work per parent (one Union, mask or vector in each parent) instead of merging across parents                                                                                                                |  ✅  |                                                          ✅ `mixed-panel.spec.ts`                                                          |
| 614 | When every selected layer is a shape (e.g. a rectangle and a Union), the "N selected" header shows Mask, Boolean and More actions (component actions and wrap in section), and Boolean wraps them in a new Union                                                                                                                     |  ✅  |                                                          ✅ `mixed-panel.spec.ts`                                                          |
| 615 | A selected free-form frame with 2+ children shows Spacing under Dimensions per axis: horizontal when the children are apart horizontally, vertical when apart vertically, both for a pseudo grid; hidden when 3+ children are unevenly spaced; a typed value moves the children                                                      |  ✅  |                                                     ✅ `frame-align-children.spec.ts`                                                      |
| 616 | A selected group shows the Group panel: opacity, corner radius, fill, stroke and effects read and write its children (hidden when a child has no such section), W/H scale the children and X/Y move them                                                                                                                             |  ✅  |                                                          ✅ `group-panel.spec.ts`                                                          |
| 617 | The Group header turns the group itself into a frame, a section, a preset-size frame, a mask or a boolean around the same children, and a non-free-form Flow turns it into a frame with that auto layout                                                                                                                             |  ✅  |                                                          ✅ `group-panel.spec.ts`                                                          |
| 618 | Several selected groups show the Group panel whose header converts each group on its own (frame, section, preset, flow, mask, boolean); groups mixed with frames or rectangles show the "N selected" panel whose appearance sections go to the groups' children, and Wrap in new section is hidden for layers from different parents |  ✅  |                                                          ✅ `group-panel.spec.ts`                                                          |
| 619 | Wrap in new section (header button, More actions, Object menu, ⌘S) wraps layers or sections at the top level or directly in a section in a new selected section 25px larger than them on every side (nested in that section); it is not offered for layers inside a frame or group, nor for layers from different parents            |  ✅  |                                                        ✅ `wrap-in-section.spec.ts`                                                        |
| 620 | A section can sit inside a section: a section drawn over a section and a section dragged onto a section land inside it, while a section still never goes into a frame or group                                                                                                                                                       |  ✅  |                                                        ✅ `wrap-in-section.spec.ts`                                                        |
| 621 | A page without its own background follows the theme (#535353 dark, #F5F5F5 light); a new page takes the background set on the page it was created from, or keeps following the theme                                                                                                                                                 |  ✅  |                                                        ✅ `page-background.spec.ts`                                                        |
| 622 | A selected section shows the Section panel (no rotation, no effects); alignment moves its children like a frame's; fill and stroke are stored on the node; Resize to fit shrinks it to its children and Frame in the header menu turns it into a frame                                                                               |  ✅  |                                                         ✅ `section-panel.spec.ts`                                                         |
| 623 | A section's name label follows its solid fill (black text on a light fill); with no solid fill it follows the page background (#444444 with a white 10% edge on a dark page, #FFFFFF with a #D7D7D7 edge on a light one)                                                                                                             |  ✅  |                                                         ✅ `section-panel.spec.ts`                                                         |

## Layers panel — lock/visibility

The Layers panel (`LeftPanel/File/Layers`) lists the active page's nodes in root order (flat, no
nesting yet) with a per-row lock and eye (visibility) toggle. Both are real document state
(`locked?`/`hidden?` on the node), joined to the undo/redo history the same way `updateNode` is.

| #   | Scenario                                                                                                                                                                            | Unit |            E2E            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 332 | Locking a node from the panel keeps it rendered but excludes it from canvas click hit-testing and marquee-select                                                                    |  ✅  | ✅ `layers-panel.spec.ts` |
| 333 | Hiding a node from the panel removes it from rendering and from canvas click hit-testing/marquee-select entirely                                                                    |  ✅  | ✅ `layers-panel.spec.ts` |
| 334 | Selecting a node from the panel works regardless of its locked/hidden state (panel selection isn't gated)                                                                           |  ✅  |             —             |
| 335 | Toggling a node's locked or hidden state is its own undo step, independent of any other change                                                                                      |  ✅  |             —             |
| 342 | Right-clicking a row that isn't currently selected replaces the selection with it, so the context menu that opens acts on the right-clicked node instead of a stale prior selection |  ✅  | ✅ `layers-panel.spec.ts` |
| 343 | Right-clicking a row already part of a multi-selection leaves the whole selection intact, so bulk actions (Copy, Bring to front, ...) keep applying to every selected node          |  ✅  | ✅ `layers-panel.spec.ts` |
| 344 | Double-clicking a row's icon selects that node and zooms the canvas to fit it (reuses the View menu's own Zoom to selection)                                                        |  ✅  | ✅ `layers-panel.spec.ts` |

Scenarios 334-335 are plain synchronous dispatch-and-assert-on-`store.getState()` checks with no
real timing/rendering stakes, so they're unit-only per the section below. 332-333 get e2e coverage
because the interesting part is genuinely the browser round-trip: a real DOM click on the panel
button changing what a _separate_ real canvas click can hit-test, which a synthetic jsdom
`PointerEvent` can't exercise end-to-end the way the actual `getNodeAtPoint`/`getCollidedNodes`
filters are wired into the live render+hit-test pipeline.

#342/#343 are a real, reported regression: `TreeItem.tsx` opened its context menu straight off
`onContextMenu` (`useTreeItemContextMenu.ts`) without ever touching selection, so right-clicking a
row that wasn't already selected opened a menu whose actions (`useNodeMenuActions.ts` — Copy, Group
selection, Bring to front, Send to back, Move to page) all operate on the Redux _selection_, not on
the row's own node — they silently acted on whatever was selected elsewhere instead. Fixed by
having `useTreeItemContextMenu` select the right-clicked id first, unless it's already part of the
current selection (mirroring the standard convention: right-clicking a member of a multi-selection
must not collapse it down to just that one row, or bulk actions would break). The unit suite
(`useTreeItemContextMenu.spec.tsx`) asserts `store.getState().design.selectedIds` directly for both
branches; the e2e versions prove the actual observable symptom via each row's own `aria-selected`
DOM state and the real menu that opens, the same "real browser + rendering" category as #90/#341
above. `move-to-page.spec.ts`'s own scenario no longer needs a throwaway left-click before the
right-click for exactly this reason.

#344: `useZoomToTreeItem.ts` (`shared/UI/Tree/TreeItem/hooks/`) wires `onDoubleClick` on the row's
icon `span` — a separate DOM node from the name text's own `editOnDoubleClick` (rename), so there's
no conflict. It dispatches `setSelection([id])` then calls the same `handleZoomToSelection` the View
menu/Shift+2 shortcut already use (a plain reducer dispatch is synchronous, so the zoom sees the
just-set selection). This makes `TreeItem` an unconditional `useCanvasRefsContext()` consumer, so
every test mounting a real `TreeItem` needs a `CanvasRefsProvider` ancestor now.

## Layers panel — drag-drop (reorder / nest)

The generic `shared/UI/Tree` drag machinery (`useTreeRowDrag/`) powers row drag-and-drop for both
the Layers panel and the Pages list. A drop either nests the dragged row inside the row it landed on
(`handleDropInside`) or reorders it among siblings at the drop's resolved depth (`handleReorderDrop`
→ `resolveTreeDrop.ts`).

| #   | Scenario                                                                                                                                                                           | Unit |              E2E              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :---------------------------: |
| 345 | Dropping a layer onto the middle of a collapsed group nests it as the first child                                                                                                  |  —   | ✅ `layers-drag-drop.spec.ts` |
| 346 | Dropping a layer onto the middle of an already-expanded group also nests it as the first child                                                                                     |  —   | ✅ `layers-drag-drop.spec.ts` |
| 347 | Holding a drag over a collapsed group auto-expands it after the spring-load delay, and releasing right there still drops into the group                                            |  —   | ✅ `layers-drag-drop.spec.ts` |
| 348 | Dragging a row onto a sibling reorders it using the target parent's own row order — forward (matching `childIds`) for an auto-layout frame, reversed (z-order) for everything else |  ✅  | ✅ `layers-drag-drop.spec.ts` |
| 349 | Dragging a Frame row into an existing Mask group, even dropped last, must not let the Frame become the active mask — it's pushed off the last slot instead                         |  ✅  | ✅ `layers-drag-drop.spec.ts` |

#348 is a real, reported regression, found right after `useTreeSource.ts` was fixed to list an
auto-layout frame's children in forward order (matching the visual layout flow — see
`.claude/docs/auto-layout.md`) instead of the reversed/z-order convention every other container
uses. That read-side fix alone broke the _write_ side: `resolveTreeDrop.ts`'s
`targetIndex = totalSiblingCount - uiOrderIndex` mirroring assumed the UI list was _always_ reversed
relative to `childIds`, so dragging a row to reorder it within an auto-layout frame silently computed
the wrong `childIds` index — often the row's own original slot, making the drag a no-op ("przerzucam
w tree 2 na 1 i nic się nie zmienia"). Fixed by threading an optional
`isForwardOrderParent?: (parentItem) => boolean` predicate through
`Tree` → `useTreeRowDrag` → `handleMouseUp` → `resolveTreeDrop`, which skips the mirroring for a
target parent that satisfies it (`LayersTree.tsx` passes `isAutoLayoutFrame`); every other consumer
(Pages list) passes nothing and keeps the original reversed behavior unchanged. The unit suite
(`resolveTreeDrop.spec.ts`) asserts the raw index math for both the forward and the still-mirrored
case; the e2e version drags a _real_ row in a _real_ auto-layout frame and asserts the resulting
Layers-panel order, since the whole point of the bug was that the write path only breaks once real
DOM row positions and the real `useTreeSource` read order interact — a synthetic `resolveTreeDrop`
call with hand-built rows can't by itself prove the two sides ever call it with matching
expectations.

## Fill section

`Common/FillSection/` (`FillRow/`) lists a node's `fills: TPaint[]` and edits each through
`UITools.ColorPickerInput` — the same input for solid and gradient paints, only its swatch/hex
adornment differs (`hexDisplayValue` shows the gradient type name, e.g. "Linear", instead of a raw
hex). Opening a gradient paint's picker also arms `design.gradientEditor` (a transient, non-history
Redux slice), which drives a Figma-style on-canvas overlay (`drawGradientHandleLayer`): the
start→end guide line, endpoint dots, and one swatch handle per stop, each independently draggable
directly on the canvas (not just via the docked panel's own `GradientBar`).

| #   | Scenario                                                                                                                                                                          | Unit |                             E2E                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------------------------------------------: |
| 385 | Adding a fill stacks a second solid layer on top and changes the render                                                                                                           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 386 | Deleting every fill leaves the shape with none and clears the render                                                                                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 387 | Typing a hex value commits it onto the fill and changes the render                                                                                                                |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 388 | Hiding a fill via the eye toggle stops it from rendering without removing it                                                                                                      |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 389 | Dragging a fill row past another reorders the stack, showing a drop indicator and a selected handle mid-drag                                                                      |  —   |                  ✅ `fill-section.spec.ts`                   |
| 390 | Clicking a fill row selects it, and clicking outside the fill list clears the selection                                                                                           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 391 | Closes the format dropdown when clicking a plain area of the fill color picker                                                                                                    |  —   |                  ✅ `fill-section.spec.ts`                   |
| 392 | Docks a gradient stop's own color panel flush against the gradient panel, not floating over its own swatch                                                                        |  —   |                  ✅ `fill-section.spec.ts`                   |
| 393 | Rotating a shape's gradient fill (panel button) updates its stored start/end and the rendered canvas                                                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 394 | Switching a solid fill to Gradient via the paint-type row actually converts and commits it, not just previews it                                                                  |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 395 | A gradient stop clamps to its own color past its own position, instead of falling back to the first stop's color                                                                  |  —   |                  ✅ `fill-section.spec.ts`                   |
| 396 | Dragging a gradient stop (in the docked panel's bar) past another stop doesn't disturb the crossed stop                                                                           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 397 | Dragging a gradient stop directly on the canvas overlay moves it along the guide                                                                                                  |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 398 | The fill picker stays open after dragging a canvas gradient stop, even if the cursor strays off it before release                                                                 |  —   |                  ✅ `fill-section.spec.ts`                   |
| 399 | Clicking the gradient guide line on the canvas adds a new stop there, at the interpolated color, and selects it                                                                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 400 | Clicking on/near an existing stop does not add a new one — stops take priority over the line                                                                                      |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 401 | Dragging a gradient endpoint on the canvas rotates the whole line around the shape's center                                                                                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 402 | Clicking (not dragging) right on a gradient endpoint doesn't add a stop there — rotating takes priority                                                                           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 403 | Rotating a gradient whose endpoints don't touch the shape edge pivots around the line's own center, not the box                                                                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 404 | Rotating a gradient snaps to exactly horizontal/vertical when the angle is close to it, with a guide                                                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 405 | Grabbing right on a gradient endpoint moves it freely, leaving the other endpoint untouched                                                                                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 406 | Dragging a gradient endpoint freely snaps onto a shape corner (edge/center landmarks)                                                                                             |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 407 | Both endpoints on the same single wall (not two distinct ones) also pivots around the line, not the box                                                                           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 408 | A gentle rotation of a box-attached, off-center gradient (e.g. corner-to-corner along one edge) doesn't jump                                                                      |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 409 | Dragging a gradient endpoint past the shape's edge lets it travel outside the shape, unclamped, like Figma                                                                        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 410 | Moving a radial gradient's center point on the canvas moves only that point (start/end handles reused)                                                                            |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 411 | Dragging a radial gradient's perpendicular radius handle reshapes it into an ellipse                                                                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 412 | Switching a gradient's type via the panel resets its points to that type's own default (e.g. radial: centered)                                                                    |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 413 | Dragging the outer ring around a radial gradient's center rotates the whole ellipse around it, fixed radius                                                                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 414 | Dragging the outer ring around a radial gradient's edge point also rotates around the center, not the edge                                                                        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 415 | Dragging a radial gradient's radius handle shows a temporary orange guide from the center, only while dragging                                                                    |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 416 | Switching a gradient's type to Angular resets its points to a centered default, same as radial                                                                                    |  —   |                  ✅ `fill-section.spec.ts`                   |
| 417 | Dragging an angular gradient's perpendicular radius handle reshapes its ellipse, same as radial's                                                                                 |  —   |                  ✅ `fill-section.spec.ts`                   |
| 418 | Dragging an angular gradient stop moves it by angle around the ellipse, not by linear position along the line                                                                     |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 419 | Clicking the ellipse guide on an angular gradient adds a new stop there and selects it                                                                                            |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 420 | Opening the picker on an existing angular gradient shows Angular in the type dropdown, not Linear                                                                                 |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 421 | Switching a gradient's type to Diamond resets its points to a centered default, same as radial/angular                                                                            |  —   |                  ✅ `fill-section.spec.ts`                   |
| 422 | A diamond gradient actually renders as a diamond shape instead of an almost-solid flat fill                                                                                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 423 | Dragging a diamond gradient's perpendicular radius handle reshapes it, exactly like radial's                                                                                      |  —   |                  ✅ `fill-section.spec.ts`                   |
| 424 | Dragging the outer ring around a diamond gradient's center rotates the whole shape, exactly like radial's                                                                         |  —   |                  ✅ `fill-section.spec.ts`                   |
| 425 | Switching a gradient fill to Solid resets the gradient panel, so switching back to Gradient starts fresh                                                                          |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 426 | Undoing a gradient edit updates the open panel's own controls (type dropdown included), not just the render                                                                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 427 | Dragging on the saturation map / a gradient stop coalesces into a single undo step, not one per pixel                                                                             |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 428 | Rotating a gradient on the canvas, then dragging a stop in the popover, keeps the canvas rotation                                                                                 |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 429 | Moving a gradient stop on the canvas updates its position live in the open popover                                                                                                |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 430 | Switching a solid fill to Pattern commits a real pattern paint and shows the Pattern panel                                                                                        |  —   |                  ✅ `fill-section.spec.ts`                   |
| 431 | A pattern fill with no source renders a placeholder dot grid instead of nothing                                                                                                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 432 | Editing the Pattern panel's tile type and scale commits them onto the pattern paint                                                                                               |  —   |                  ✅ `fill-section.spec.ts`                   |
| 433 | Switching away from Pattern and back resets the panel instead of resurfacing the old values                                                                                       |  —   |                  ✅ `fill-section.spec.ts`                   |
| 434 | The Direction row only shows for the Hexagonal tile type                                                                                                                          |  —   |                  ✅ `fill-section.spec.ts`                   |
| 435 | Picking a shape as the pattern source on canvas writes its id onto the paint and disarms picking                                                                                  |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 436 | A picked pattern source renders live and repeats as tiles, not a single stretched copy                                                                                            |  —   |                  ✅ `fill-section.spec.ts`                   |
| 437 | Deleting a pattern's source freezes the consumer's last appearance instead of reverting to the placeholder                                                                        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 438 | Increasing pattern spacing opens a visible transparent gap between tiles instead of leaving them flush                                                                            |  —   |                  ✅ `fill-section.spec.ts`                   |
| 439 | Changing pattern alignment shifts which part of the tile grid sits flush with the shape                                                                                           |  —   |                  ✅ `fill-section.spec.ts`                   |
| 440 | Editing a Pattern panel setting after picking a source preserves the live sourceNodeId instead of dropping it                                                                     |  ✅  | ✅ `fill-section.spec.ts` (spacing test also exercises this) |
| 441 | Hexagonal tiling with Horizontal direction offsets alternate rows, creating a brick pattern                                                                                       |  —   |                  ✅ `fill-section.spec.ts`                   |
| 442 | Hexagonal tiling with Vertical direction offsets alternate columns, creating a brick pattern                                                                                      |  —   |                  ✅ `fill-section.spec.ts`                   |
| 443 | Picking a node that itself has a pattern fill as a source is refused, preventing A<-B<-C chains                                                                                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 444 | A numeric pattern offset (X/Y, in px) nudges the tile grid independently of the alignment point                                                                                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 445 | Shrinking a pattern source's text content does not leave a black shadow of the removed glyphs                                                                                     |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 446 | Hovering an eligible node while picking a pattern source shows a live highlight, like the default tool                                                                            |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 447 | Hovering a node that already has a pattern fill while picking a source shows no highlight                                                                                         |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 448 | Uploading an image commits a real image paint and renders it, filling the shape without distorting proportions                                                                    |  —   |                  ✅ `fill-section.spec.ts`                   |
| 449 | The fill's alpha field changes the rendered image's opacity, not just the paint's stored value                                                                                    |  —   |                  ✅ `fill-section.spec.ts`                   |
| 450 | The rotate button turns an image fill 90° per click, and each turn is its own undo/redo step                                                                                      |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 451 | Switching the fill mode to Fit contains the image inside the shape instead of cropping it to cover                                                                                |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 452 | Picking Image with no source yet renders a checkerboard placeholder on the shape                                                                                                  |  —   |                  ✅ `fill-section.spec.ts`                   |
| 453 | Picking a new image while Fit is already selected in the dropdown renders it as Fit, not Fill                                                                                     |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 454 | Opening the Image tab enters a position-editing mode for the node, cleared again on Escape/deselect                                                                               |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 455 | Resizing the shape while its Image position-editing mode is active switches it into crop mode                                                                                     |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 456 | Resizing the shape into crop mode also switches the panel's fill mode dropdown to Crop                                                                                            |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 457 | Resizing the shape while still in position mode leaves a manually-picked fill mode dropdown value untouched                                                                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 458 | Dragging inside the shape while in crop mode selects the image and moves only its own crop rect, not the frame                                                                    |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 459 | Clicking the frame outside the moved image switches the selected target back to the frame                                                                                         |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 460 | Manually picking Crop from the dropdown enters crop mode immediately, without needing a resize first                                                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 461 | Reopening the Image tab after a crop was already committed re-enters crop mode immediately, not position                                                                          |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 462 | Hovering the image crop rect's own handles while it is the selected target shows resize/rotate cursors                                                                            |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 463 | Dragging a resize handle past the opposite anchor mirrors an image fill, and dragging back un-mirrors it                                                                          |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 464 | A second image-filled shape renders correctly alongside the first, and both survive deselecting                                                                                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 465 | Dragging a resize handle past the opposite anchor mirrors a pattern fill too, and dragging back un-mirrors it                                                                     |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 466 | Clicking a completely different shape while the Image editor's position mode is active exits it, unselected                                                                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 467 | Clicking a completely different shape while crop mode is active exits the editor, without selecting that shape                                                                    |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 468 | Rotating the frame on canvas while its image editor is active in crop mode leaves the crop untouched                                                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 469 | Resizing the frame again on canvas while already in crop mode leaves the crop untouched                                                                                           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 470 | Rotating via the panel's own rotate button still carries the crop along, unlike a canvas rotate-handle drag                                                                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 471 | The ImageCrop panel's Dimensions row locks aspect ratio permanently, scaling the other axis to match                                                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 472 | Clicking Flip horizontal in the ImageCrop panel flips the image's own paint, not the frame                                                                                        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 473 | Clicking the frame after focusing the image reopens the fill picker panel on its own, without a swatch click                                                                      |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 474 | Escape while the image is focused fully exits the editor but still reopens the fill picker panel                                                                                  |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 475 | Dragging the image within its frame snaps to center/edge alignment with the frame, drawing a smart guide                                                                          |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 476 | Picking Tile enters tile mode with a 50% default scale, and dragging a corner scales the tile only (no move/rotate)                                                               |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 477 | Dragging the Saturation adjustment slider to its minimum actually desaturates the rendered image, not just the paint                                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 478 | A pattern keeps rendering correctly on its consumer after zooming in heavily, even with its source far away and off-screen                                                        |  —   |                  ✅ `fill-section.spec.ts`                   |
| 479 | Dragging crop on an Image fill with no asset picked yet pans the checker placeholder itself, not just the crop outline                                                            |  —   |                  ✅ `fill-section.spec.ts`                   |
| 480 | Cropping an Image fill with no asset picked yet still previews the checker placeholder beyond the frame, dimmed                                                                   |  —   |                  ✅ `fill-section.spec.ts`                   |
| 481 | Picking a real file over a placeholder already cropped/panned keeps that same crop, instead of resetting to a fresh one                                                           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 482 | Selecting a shape with an image fill shows the Image edit toolbar (Crop/Select area/Remove background/Edit with prompt/More)                                                      |  —   |                  ✅ `fill-section.spec.ts`                   |
| 483 | The Image edit toolbar hides once crop mode is entered (it would otherwise overlap the crop UI), reappearing once crop mode exits                                                 |  —   |                  ✅ `fill-section.spec.ts`                   |
| 484 | Picking Crop right after Tile (via the dropdown, or via a resize that auto-enters crop) clears the stale tile scaleMode/scale                                                     |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 485 | Entering crop mode shows an Expand button inset near the frame's bottom-right corner, click-through so it never steals the resize handle                                          |  —   |                  ✅ `fill-section.spec.ts`                   |
| 486 | Clicking Crop in the Image edit toolbar enters crop mode on the target image fill, seeding a crop rect if none existed yet                                                        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 487 | Opening a second image fill's picker closes a stale one left open from a previous image-focus session, instead of both staying open and racing over which fill gets edited        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 488 | Clicking Crop preserves whichever fill row was genuinely selected in the panel, instead of the toolbar's own click always falling back to fill 0                                  |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 489 | Switching the picker to a different fill row clears the global image editor state left by the previous fill (e.g. Tile mode), instead of staying stuck showing it                 |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 490 | Clicking anywhere else in the right panel exits the Image editor mode, the same as clicking the canvas already does                                                               |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 491 | Cycling through several image fills that each already have a committed crop (0→1→2→0→1) always enters crop mode on whichever fill was just clicked, never landing on null         |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 502 | A blend mode picked from the paint-type row's trailing icon commits onto the fill and survives a paint-type switch (solid → image)                                                |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 503 | The contrast checker toggle (solid tab only) shows the ratio against the page background and draws the overlay on the saturation map; ratio updates when the background changes   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 504 | Contrast checker measures against the parent frame's opaque solid fill, not the page background                                                                                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 505 | Contrast checker blends a semi-transparent parent fill over the page background                                                                                                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 506 | Contrast checker picks the parent fill with the highest opacity among several fills                                                                                               |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 507 | Contrast checker skips a parent with no visible fill and falls back to the page background                                                                                        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 508 | Contrast checker is locked ("Background has blend mode") when a parent has a blend mode in appearance                                                                             |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 509 | Contrast checker is locked ("Background has blend mode") when the chosen parent fill has a blend mode                                                                             |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 510 | Contrast checker is locked ("Gradient background") when the chosen parent fill is not solid                                                                                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 511 | Contrast checker is locked ("Mixed background") when the page background is hidden                                                                                                |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 512 | Hovering the contrast level button previews the nearest compliant point on the saturation map; clicking moves the handle there and the preview does not return on later map drags |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 513 | A set blend mode shows a Blend mode row under Opacity/Corner radius; its dropdown changes the mode and its minus (tooltip "Remove") resets it to Pass through and hides the row   |  ✅  |                ✅ `appearance-panel.spec.ts`                 |
| 514 | An empty Fill section is muted with its styles icon hidden until hovered, and returns to normal once it has fills                                                                 |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 515 | The right panel scrolls its properties with the custom scroll thumb only once they overflow the panel height (header stays fixed)                                                 |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 516 | The Stroke section adds a solid stroke paint with a default 1px width next to the fills, and its picker recolors only the strokes                                                 |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 517 | A stroke paint is drawn on the canvas as an inside ring: its color in the edge band, the fill untouched inside, nothing just outside                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 518 | The stroke settings row (Position, Weight, advanced and individual buttons) appears only once a stroke exists and shows the inside / 1px defaults                                 |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 519 | Typing a weight in the stroke settings row updates the stroke width                                                                                                               |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 520 | The Tile mode of an image stroke arms the image editor for the strokes, not the fills                                                                                             |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 521 | The Crop mode of an image stroke seeds a crop on the stroke; dragging the image moves it and leaves the fills alone                                                               |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 522 | Choosing Outside then Center in the stroke Position dropdown writes strokeAlign to the node                                                                                       |  ✅  |                 ✅ `stroke-section.spec.ts`                  |
| 523 | The individual strokes menu limits the stroke to one side, Custom shows four fields with Mixed, and All takes the largest weight                                                  |  ✅  |                 ✅ `stroke-section.spec.ts`                  |
| 524 | The advanced stroke settings button opens a panel with three tabs and Basic rows that are 32px high                                                                               |  ✅  |                 ✅ `stroke-section.spec.ts`                  |

#393-#409 are all real, reported regressions. #410-#420 are new feature coverage (radial and angular
gradient on-canvas editing), not bug fixes, but every one of #412-#415 was raised by the user as
same-day follow-up feedback right after #410-#411 landed, rather than requested up front — #412
(switching types left stale, nonsensical positions behind) and #413-#415 (the rotate ring and radius
guide the first radial pass didn't include) are closer to fast-follow fixes than a fresh feature
request. #416-#418 (angular) came later still, as a separate request specifically to extend the
already-shipped radial handles onto the angular gradient type, and #419-#420 are same-day follow-up
fixes on top of #416-#418 in exactly the #412-#415 mold — gaps the angular pass itself left behind,
caught by the user comparing directly against the on-canvas result.

#395: the gradient fragment shader's `sampleGradient` seeded its "outside every stop's range"
fallback color to `u_stopColors[0]` unconditionally, so a stop dragged short of the far end (e.g.
white at 0%, black moved to 50%) rendered white from 50%-100% instead of clamping to black — the
seed needed to pick `u_stopColors[0]` or `u_stopColors[count-1]` depending on which side of the
range `t` fell on. GLSL isn't unit-testable here, so this is e2e-only, sampling a pixel past the
last stop.

#396: `useGradientBarDrag`'s thumbs are re-sorted by position on every drag update, which physically
reorders their DOM nodes once a drag crosses another stop — and reordering the element currently
holding native `setPointerCapture` silently releases it, so the very next `pointermove` lands on
whichever thumb is now on top and briefly drags _that_ one instead ("kiedy zderzam się z innym
stopem to na chwilę go zabiera"). Fixed by tracking the drag via a ref plus `window`-level
`pointermove`/`pointerup` listeners instead of per-thumb capture, immune to any DOM reordering.

#397-#398 are the canvas-side counterpart: gradient stops became draggable directly on the on-canvas
overlay (previously render-only), reusing the same hit-test/arm/continue/disarm pattern as every
other canvas handle (`getGradientStopHandleAtPoint`, `armGradientStopDrag`,
`continueGradientStopDrag`), with the dragged stop re-identified by its own color+opacity fingerprint
each frame (not by array index, which shifts under it exactly like #396) since the shader still
needs `paint.stops` kept position-sorted for correct interpolation. #398 is a second regression this
introduced: Radix's `Popover` defers its "was this click outside the content" check to the native
`click` event that fires _after_ `pointerup`, so clearing the drag ref synchronously on pointerup
made that deferred check see "no drag in progress" and dismiss the fill picker — fixed by deferring
the ref clear one macrotask (`setTimeout(0)`) past pointerup, and by narrowing the picker's
`onInteractOutside` guard to only ignore clicks that actually hit a gradient handle (not every
canvas click, which would wrongly keep the picker open when clicking the shape itself elsewhere).

#399: hovering the guide line itself (not an existing stop) now shows an "add stop here" preview —
the same real stop-handle visual, offset above the line exactly like a real stop, colored via the
actual interpolated gradient color at that position (not the nearest stop's raw color, so adding a
stop never visibly changes the gradient) — and clicking inserts + selects it. #400 confirms existing
stops keep priority over the line at the same spot (the line's own hit-test explicitly bails when the
stop hit-test already matched, same defensive double-encoding as the resolver-array ordering).
Adding a stop from the canvas only touched Redux, so the docked panel's own stop list/`GradientBar`
didn't reflect it — fixed by `useSyncExternalStopChanges`, reconciling the panel's local
`TEditableGradientStop[]` against Redux's plain `TGradientStop[]` by position+color+opacity so
existing stops keep their React key (`id`) and only the genuinely new one gets a fresh one; #399's
own assertion on the panel's stop-marker count covers this reconciliation too.

#401-#402: the line's own start/end endpoints became draggable to rotate the gradient continuously
(separate from the panel's discrete 90°-at-a-time rotate button, #393). Dragging either endpoint
rotates the whole line as a rigid body around the shape's bounds center — both endpoints are
recomputed every frame as the two opposite intersections of a line through the center with the
bounding box edge, so they visibly slide around the shape's perimeter. #402 is the same
priority-guard pattern as #400, one hit-test zone further out: the rotate hit-test also bails the
line's own hit-test near the endpoints, so clicking exactly on an endpoint rotates instead of
inserting a spurious stop there.

#403: that box-center pivot only applies when both endpoints already touch the shape's bounding-box
edge at drag-start. A gradient the user positioned freely inside the shape (not spanning it) instead
pivots around the _line's own midpoint_, at its own frozen half-length radius — checked once when the
drag starts and never re-evaluated mid-gesture (an explicit user call: re-checking every frame would
make the pivot jump under the cursor). #404: either mode also snaps the line to exactly horizontal or
vertical when the angle comes within 3° of one, showing a smart guide — reusing the app's existing
alignment-guide ref/draw pipeline (built for snapping a dragged shape to a sibling's edge) rather than
adding new drawing code, since it was already wired unconditionally into the render loop.

#405-#406: grabbing right on an endpoint (a tight ~6px zone, tighter than the rotate ring around it)
moves that one point freely instead of rotating — added after it turned out the rotate-only version
left no way to just reposition a point at all. It affects only the dragged endpoint (unlike rotate,
which always moves both). #406: while moving, each axis independently snaps to 0/0.5/1 (the shape's
edges and center), reusing the same alignment-guide pipeline as #404 — but this one can show both a
horizontal and a vertical guide at once, e.g. when landing exactly on a corner.

#407: "box" mode's distinct-walls requirement was made explicit after the user pointed out that two
endpoints sharing only the _same_ single wall (both on the top edge, say) must not be treated the same
as a true corner-to-corner span — refined via `getTouchedRectEdges.ts`, which returns every wall a
point touches (a corner touches two) so "distinct" can be checked properly instead of just "each
touches _some_ wall."

#408 is the deeper regression underneath #401/#403/#407: "box" mode measured both endpoints' angles
from the box's own geometric center unconditionally, which is only correct when the line already
straddles that center symmetrically (any true diagonal always does, by construction — which is why
#401 never caught this). The user's own repro didn't: a corner-to-corner line along one entire edge
(both ends on the bottom wall, touching distinct left/right walls too, so still legitimately "box"
mode) sits nowhere near the vertical center. The very first rotate frame forced it through the center
anyway, snapping the untouched endpoint far from where it started ("wygląda jak reset pozycji żeby
trzymały się środka"). Fixed by freezing an _angle offset_ at arm-time (the real gap between the
non-dragged endpoint's starting angle and what naive antipodal symmetry would predict) and adding it
back every frame — a true diagonal's offset works out to 0 (no behavior change), while an off-center
line keeps its own shape continuously as it rotates. An earlier fix attempt (casting a ray from the
line's own frozen midpoint to the box edge, instead of from the box center) was mathematically sound
in general but degenerated to a zero-length collapse whenever that frozen midpoint itself sat exactly
on a wall — exactly this case — since the antipodal ray then points back into the very wall it's
already on. Reverted in favor of the always-safely-interior box-center-plus-offset approach.

#409: the free-move interaction (#405) originally clamped the dragged endpoint to the shape's own
0..1 bounds ("tylko w obrębie elementu"). The user later asked for that clamp to be removed —
Figma lets a gradient endpoint travel outside the shape entirely. Nothing downstream assumed the
0..1 range (the world-point lerp, the hit-test, and the per-axis landmark snap all already worked
for any value), so the fix was simply deleting the clamp in `continueGradientEndpointMoveDrag.ts`.

#410-#411: radial gradients (`gradient-radial`, previously render-only with no on-canvas editing at
all) got the same start/end/stop handles as linear for free, by widening every hit-test/drag guard
from a literal `paint.type === 'gradient-linear'` check to a shared `isLineHandleGradientPaint`
predicate — #410 confirms moving the center point (`start`) behaves exactly like linear's endpoint
move (only that point changes; an explicit product decision, not a translate-the-whole-gradient
model). #411 covers the one genuinely new piece: a second, always-perpendicular "radius" handle
(`radiusRatio` field, new) that reshapes the circle into an ellipse — locked to the perpendicular
axis by construction, so it can only scale, never skew or rotate. This also uncovered (and fixed) a
pre-existing modeling issue: the radial shader treated the _midpoint_ of start/end as the visual
center, when `start` should be the center (matching Figma) — fixed alongside, see
`.claude/docs/properties-panel.md` for the full technical writeup. The radius handle also lost its
connecting line after #410-#411 shipped — the user pointed out it read as a second gradient axis,
not a scale control, so it now renders as a lone point instead.

#412: switching a gradient's type via the panel's dropdown (`useSetGradientType`) used to keep
whatever `start`/`end` the _previous_ type had, verbatim. Combined with #410-#411's fix (radial's
`start` is now the true center, not the midpoint of start/end), this meant switching an arbitrary
linear gradient to radial put the new "center" wherever the old line's start point happened to be —
often nowhere near the shape's middle. Fixed by giving type-switching its own small per-type default
table: radial resets to a centered point with the radius reaching the bottom edge; every other type
resets to the existing default horizontal line (which keeps diamond centered, since its own center
is still the midpoint of start/end — angular later moved onto the radial-style centered default too,
see #416-#418). Test drives the actual dropdown UI (not just a Redux dispatch) to catch regressions
in the real click path.

#413-#414: the first radial pass left rotation to `end`'s free-move alone (it already sets angle and
magnitude at once), on the theory that a dedicated fixed-radius rotate ring wasn't needed the way
linear's box/line modes needed one. The user asked for it back: a genuine rotate, reachable from
_either_ the center's ring or the edge point's ring, both pivoting at the center and holding the
radius constant. Implemented as a third `TGradientRotateMode` ('radial') on the existing rotate
dispatcher rather than a parallel hit-test/arm/continue stack — `getGradientRotateHandleAtPoint`'s
dual-ring check was already shared via `isLineHandleGradientPaint`, so it needed no radial-specific
branch at all once widened. #413 confirms grabbing the center's ring; #414 confirms grabbing the
edge point's ring produces the _same_ rotation (still pivoting at the center, never at the edge
point itself) — arming is endpoint-agnostic on purpose, since the center never moves in this mode
regardless of which ring was grabbed.

#415: while the radius handle (#411) is being dragged, a temporary guide line + crosshairs now
connects it back to the center, in the same orange used by ordinary alignment/snap guides elsewhere
in the app — cleared the instant the drag ends. An earlier version tried asserting an exact RGB
sample at the guide's midpoint, which turned out fragile against the radial's own busy, continuously
blended fill color underneath; the test instead samples the _same_ pixel once mid-drag and once
right after release at the same cursor position (so the underlying fill is provably identical in
both frames) and asserts the two differ — isolating the guide's presence as the only variable,
without needing to know its exact rendered color.

#416-#418: angular gradients (`gradient-angular`, previously render-only, same as radial before
#410) got the exact same center/edge/radius-ratio handles as radial for free, by widening every
`paint.type === 'gradient-radial'` guard that gated them (the radius handle draw/arm/continue/
hit-test, and the rotate dispatcher's `'radial'`-mode branch) to a shared `isEllipseHandleGradientPaint`
predicate — #416-#417 confirm the type-switch default and the radius handle behave identically to
radial's own #412/#411. #418 covers the one thing that couldn't just be reused: an angular stop's
`position` is an angle around the ellipse (matching the fragment shader's own `atan2`-based
interpolation), not a linear fraction of the start->end segment the way every other gradient type's
stops work — dragging a stop off the line entirely (onto the perpendicular radius-handle point, in
the test) had to land at the angle that point sits at (0.25 of a full turn) rather than clamping to
0 or 1 the way a line-projection formula would. This also meant the "click the line to add a stop"
feature (#399) deliberately does _not_ apply to angular: every point on the start->end segment maps
to the same angle, so there is no meaningful position to derive from a click offset along it. Fixing
this properly also required correcting the fragment shader's angular branch, which had been deriving
its center from the _midpoint_ of start/end (a leftover from angular's old symmetric-default model)
instead of `start` itself, the same pre-existing modeling gap #410-#411 had already fixed for radial
— see `.claude/docs/properties-panel.md` for the full technical writeup, including why the shader
change also had to start honoring `radiusRatio` for angular to keep the rendered fill consistent with
what the on-canvas ellipse handle now shows.

Also worth recording even without its own numbered e2e scenario: fixing #415 alongside a stop-marker
bug the user found — `getGradientStopHandlePositions` offset every stop by a fixed "up" vector,
which only kept the marker off the line for a near-horizontal gradient; a vertical line (radial's own
default) kept the offset marker sitting exactly on top of the guide instead of beside it. Generalized
to a real perpendicular-to-the-line offset, plus rotating the marker's own square (`drawRect` already
took a rotation angle, previously always `0`) so one edge sits parallel to the line rather than
staying axis-aligned. Covered by unit tests (`getGradientPerpendicularOffsetDirection.spec.ts`,
updated `getGradientStopHandlePositions`/`drawGradientStopPointer`/`drawSingleGradientStopHandle`
specs) rather than a new e2e scenario — the change has no Redux-observable effect (a stop's own
`position` field never changes), only a rendering one, so exact-geometry unit coverage is the more
precise and less fragile way to pin it down than sampling canvas pixels.

Also worth recording without a numbered e2e scenario: after #416-#418 shipped, the user pointed out
that the ellipse itself was never actually drawn as a curve on the canvas — radial (and now angular)
only ever rendered the straight start->end line plus the point handles, missing the oval outline
Figma's own reference UI shows connecting them. Fixed with a new `drawGradientEllipseGuide`, always
called from `drawGradientHandleLayer` (it no-ops itself for linear via `isEllipseHandleGradientPaint`).
Covered entirely by unit tests (`drawGradientEllipseGuide.spec.ts`, plus the renamed
`getGradientEllipsePoint`/`getGradientEllipseNormalizedPoint` specs) for the same reason as the
stop-marker offset fix above — purely a rendering change with no Redux-observable effect, so
exact-geometry assertions on the drawn line segments are more precise than a canvas pixel sample.

One more follow-up once the ellipse guide (above) made the curve visible: an angular stop marker's
own position (`getGradientAngularStopHandlePositions`) placed the marker's _center_ exactly on the
ellipse, unlike linear/radial's stops which are nudged `STOP_HANDLE_OFFSET_PX` (18px) off their line
so the marker sits _beside_ the guide with its little pointer notch touching it. With no such
offset, an angular marker straddled the curve with its notch pointing inward past it instead of
touching it from outside — the user caught this by comparing the on-canvas notch against the curve
directly. Fixed by reusing the exact same `STOP_HANDLE_OFFSET_PX` constant, applied in the outward-
from-center direction (`getGradientRadialOutwardDirection`) instead of perpendicular-to-the-line,
threading the world center point and zoom through to `getGradientAngularStopHandlePositions` (both
were already available at every call site via `getGradientStopPositions`, just previously unused for
the angular branch). Covered by updated unit tests on that function plus `getGradientStopPositions`/
`drawGradientHandleLayer`/`getGradientStopHandleAtPoint` specs (exact offset math) and the e2e
`fill-section.spec.ts` angular stop-drag test (updated grab point) — no new numbered scenario, same
reasoning as the two fixes above it.

#419: with the ellipse guide now visible (the fix above), the user tried clicking directly on it to
add a stop, the same way clicking the straight line already works for linear/radial (#399) — nothing
happened, since `getGradientLinePositionAtPoint` explicitly excludes angular (a deliberate scope cut
made when angular's stop-by-angle model first shipped: every point on the straight line maps to the
same angle, so a line-click position is meaningless for it). Fixed with a new
`getGradientEllipsePositionAtPoint.ts`, the ellipse-curve counterpart of the line hit-test (same
priority-guard chain — stop/endpoint-move/rotate/radius handles all still win over it — but computes
`position` via `getPositionAroundGradientEllipse` and checks distance against the actual curve point,
`getGradientEllipsePoint`, rather than a projected line point), and a new
`getGradientAddStopPositionAtPoint.ts` wrapper that dispatches to it for angular paints and falls
back to the existing line hit-test otherwise — replacing `getGradientLinePositionAtPoint` at its
two call sites (`armAddGradientStopOnPointerDown`, `resolveGradientLineHover`) so the add-stop cursor, hover ref, and click handler all agree on
which guide applies. `drawGradientAddStopHoverPreview` also needed the angular branch: its ghost
preview marker now samples the ellipse (`getGradientEllipsePoint`) instead of the line, and reuses
the same outward-offset direction as the real stop markers.

#420: opening the color picker on a shape whose fill was already `gradient-angular` showed "Linear"
in the type dropdown regardless — `useGradientPanel`'s `type` state (what the dropdown's `value` prop
reads) was hardcoded to always initialize from `DEFAULT_GRADIENT_TYPE`, both on first mount and on
every reopen (`useResetGradientPanelOnReopen`), never from the paint actually being edited. This
affected every non-linear type equally (radial included), just surfaced here specifically while
testing angular. Root cause: `TInitialGradient` (what `FillRow` builds from the real paint and passes
down as `initialGradient`) never carried a `type` field at all — only `start`/`end`/`stops`. Fixed by
adding `type` to `TInitialGradient`, populating it in `FillRow.tsx` from `paint.type`, and seeding
`useGradientPanel`'s `type` state from `initialGradient?.type` (falling back to the default only when
there's no seed, e.g. a brand-new gradient) in both places it was previously hardcoded.

Also worth recording without its own numbered scenario: right after #419-#420, the user flagged that
an angular stop marker's own rotation looked "tilted too much" at some positions around the ellipse.
The marker's rotation (and its outward offset direction) had been computed as the vector from the
ellipse's center to the stop — correct only at the 4 axis vertices of a true ellipse; everywhere else,
"away from center" and the curve's own tangent/normal diverge for anything other than a perfect circle
(a non-1 `radiusRatio`, or simply a non-square node, both turn the normalized-space circle into a
genuine world-space ellipse). Fixed with a new `getGradientEllipseNormalDirection.ts`, computing the
true normal from the curve's derivative (tangent) at that position instead of approximating it from
the center, with the correct outward-facing sign disambiguated against the old radial approximation —
it reduces to the exact same vector at the axis vertices and on a perfect circle (proven by a unit
test looping every position for a square node), so no existing screenshot/geometry changes, only the
previously-wrong in-between angles. Replaced `getGradientRadialOutwardDirection` at all three call
sites that compute an angular stop's own orientation (`getGradientStopDirections`,
`getGradientAngularStopHandlePositions`, `drawGradientAddStopHoverPreview`) — covered entirely by unit
tests (exact-geometry assertions, including one that deliberately proves the new function _diverges_
from the old one for a stretched ellipse) rather than a new e2e scenario, same rendering-only
reasoning as the fixes above.

#421-#422: the diamond gradient type had never actually worked — a shape with a diamond fill
rendered as almost solid flat color, unrelated to and predating the angular work above. Root cause
in the shader (`vectorGradientFillFragmentShaderSource.ts`): diamond's branch computed
`halfSize = abs(u_end - center)` where `center = (u_start + u_end) * 0.5`, which only produces a
sensible (nonzero on both axes) `halfSize` if `u_start`/`u_end` are two _opposite corners_ of the
diamond's bounding box. But diamond's default points were still the linear "two opposite edge
points on the same horizontal line" (`start: (0, 0.5)`, `end: (1, 0.5)`) — under that model `center`
lands at `(0.5, 0.5)` and `halfSize` comes out `(0.5, 0)`, a zero y-extent; dividing by that
(clamped to `0.0001`) blew `t` up to a huge value everywhere except a thin horizontal band, so
`sampleGradient` clamped almost the entire fill to the last stop's color. Fixed the same way angular
was: diamond's branch now pivots at `u_start` like radial/angular, projecting onto the primary axis
and its `radiusRatio`-scaled perpendicular exactly like radial's branch, but sums the two components
with `abs(a) + abs(b)` (L1 distance) instead of `length(vec2(a, b))` (L2) — that's the only
difference between an ellipse and a diamond in this shared basis. `getDefaultGradientPoints` and the
`radiusRatio` uniform gate both widened to include `'gradient-diamond'` alongside radial/angular, so
switching to Diamond now seeds a proper centered default too. At the time of this fix, diamond still
had no on-canvas handles — `isLineHandleGradientPaint`/`isEllipseHandleGradientPaint` deliberately
still excluded it.

#423-#424: the user confirmed diamond should get the exact same on-canvas handle rules as radial. This
turned out to need no new geometry at all: diamond's `stop.position` is already a plain linear lerp
along the line (same as radial — only angular diverges into angle-based positions), so every
position/direction helper already fell into the shared non-angular branch. The fix was purely widening
`isLineHandleGradientPaint` and `isEllipseHandleGradientPaint` to include `'gradient-diamond'`, which
transitively wired up the whole handle overlay, the radiusRatio/aspect handle and its drag, and the
`'radial'` fixed-pivot rotate mode. Deliberately not widened: the ellipse-guide-curve drawer keeps its
own narrower check, since a diamond's real boundary is a rhombus, not an ellipse, and drawing a curved
guide over it would be misleading — no diamond-shaped guide exists yet. A pre-existing bug surfaced
during this work, unrelated to diamond: `useConvertSolidToGradientPaint` (which every panel change,
including a plain stop-color edit, funnels through) only preserved `radiusRatio` for
`type === 'gradient-radial'`, so editing a stop's color on an _angular_ gradient with a custom
`radiusRatio` silently reset it to 1 on the next keystroke — fixed by widening that check too.

#425-#427: three separate bugs reported together, all in the same root cause — `useGradientPanel`'s
local state is a working copy seeded once from the paint, with no general mechanism to notice the
paint changed underneath it. #425: switching to Solid left the old gradient's stops/type/points
sitting in local state, so switching back to Gradient in the same popover session resurfaced the old
paint instead of a fresh default — fixed by resetting that local state directly in the Solid-tab
click handler (`useSetActiveTab.ts`), not with another watch-effect. #426: undo/redo changes the
paint in Redux exactly the same way a real edit does (`replaceDesignSnapshot` vs. `updateNode`), so
the open panel had no way to tell "my own edit echoing back" apart from "the ground truth changed
externally" — fixed with a new `design.historyRevision` counter, bumped only by
`replaceDesignSnapshot`, that the panel now also resyncs on (alongside the existing reopen-triggered
reset), so undo/redo now updates every part of the open panel, the type dropdown included, which
previously stayed frozen on its pre-undo value. #427: dragging on a stop's saturation map or the
gradient bar pushed one history entry per pixel, because the existing begin/end-gesture coalescing
already used everywhere else (canvas drags, the Solid panel) simply never reached the Gradient tab —
`Body.tsx` only forwarded `onDragStart`/`onDragEnd` to `SolidPanel`. Threading them into
`GradientPanel`/`GradientBar`/`StopsList`/`StopRow`/`StopColorPanel` fixed it for the whole tab in one
pass, including the docked stop-color editor's own saturation map. One e2e gotcha from writing #426:
`Control+z` sent while focus is still on the type dropdown's own trigger button does nothing — that
component swallows the keydown — so the test clicks the inert "Stops" label first to move focus off
it before invoking the shortcut.

#428-#429: the very next report after #425-#427, and really the flip side of the same coin. The
`historyRevision` mechanism from #426 only caught undo/redo (`replaceDesignSnapshot`); a canvas-driven
gradient drag dispatches the same `updateNode` action the panel's own edits use, so it wasn't
detected as "external" at all — rotating/moving the line on the canvas, then dragging a stop inside
the still-open popover, silently snapped the line back to its pre-rotation position (#428), and
dragging a stop's position on the canvas never showed up in the popover's own position field while it
stayed open (#429). Fixed with a general resync (`useSyncGradientPanelWithLivePaint.ts`) that
reconciles points/type/stops from the live paint on every render where they actually differ, gated by
a new `isDraggingRef` (`useTrackIsDragging.ts`, wrapping the popover's existing `onDragStart`/`onDragEnd`)
so the panel's own in-progress drag is never fought mid-gesture. This made `historyRevision` redundant
— undo/redo is just another "external change" the general mechanism now catches — so it was removed
again along with its prop-threading, rather than leaving two overlapping sync mechanisms in place.

#430-#435 are the Pattern paint type: a fourth `TPaint` variant alongside solid/gradient/image,
edited through the same `ColorPickerInput`/`PaintTypeRow` as the others. With no source picked yet it
renders as a plain dot-grid placeholder (`drawVectorPatternFill`) rather than nothing, so an empty
pattern is still visibly distinct from a missing fill. #435 wires the "Select source..." button
(`design.isPatternSourcePicking`, an arm/disarm flag) to an actual canvas click: a `TPatternSourcePickTarget`
(`{nodeId, paintIndex}`) is synced into Redux for as long as the Pattern panel stays open
(`useSyncPatternSourcePickTarget`, mirroring `useGradientEditor`'s own sync hook), so the next primary
click on the canvas while armed (`handlePatternSourcePick`, wired into `useSelectionTool`'s existing
pointer-down dispatch) writes the hit node's id onto `paint.sourceNodeId` and disarms — refusing only
the trivial self-reference case (picking the node's own fill as its own source) for now.

#436-#437 finish the loop: the picked source now actually renders, live, tiled onto the consumer
(`resolvePatternSourceTile`/`drawVectorPatternSourceTile`, `.claude/docs/canvas-rendering-pipeline.md`
has the shader/render-target details), and deleting that source no longer leaves a dangling
`sourceNodeId` — `freezePatternConsumersOfNode` (called from `handleDeleteNode` before the node is
actually removed) snapshots the source's own subtree onto `frozenSourceSnapshot` and clears
`sourceNodeId`, so the consumer keeps its last-known appearance forever rather than reverting to the
dot-grid placeholder. Cycle-safety beyond the trivial self-pick case is still open, though a depth
cap on the render side already prevents a multi-hop cycle from hanging the tab.

#438-#440 wire `spacingX`/`spacingY`/`alignmentIndex` into the actual render. Fixing #438/#439
surfaced a real bug (#440): `useConvertToPatternPaint` rebuilds the whole `TPatternPaint` from the
panel's own local state on every field edit, so it silently dropped `sourceNodeId`/
`frozenSourceSnapshot` the moment a user touched any setting after picking a source — caught while
writing #438's e2e test (reopening the panel and setting spacing turned the picked source's green
tile white, i.e. it had reverted to the sourceless placeholder). Fixed by carrying both fields
forward from the existing paint when it's already type `'pattern'`.

#441-#442 finish `tileType: 'hexagonal'`/`direction`, the last two Pattern panel fields that didn't
touch the render. This isn't literal hexagon-shaped tiles — like Figma's own Hex Horizontal/Vertical
pattern fill, it's a brick-style offset of alternating rows or columns by half a tile, still sampling
the same rectangular tile texture. Verified by picking a source, opening a spacing gap on one axis,
and asserting the same point that was inside the gap on one row/column lands inside a tile once the
neighboring row/column shifts by half a period.

#443 closes out the original pattern-fill design question's last open item: cycle prevention. The
decision (made explicitly, after going back and forth on "just detect real cycles" vs "block chains
entirely") is to disallow `sourceNodeId` chains outright rather than detect cycles in the dependency
graph — a node (or anything in its own subtree, for a Frame source) that already has any `'pattern'`
fill can never be picked as someone else's source. If C should look like A, C must pick A directly;
routing through B (which itself consumes A) is refused the same way self-picking already was.

#444 is the last field from the original design question's panel wishlist ("x y, file type, direction
i scale") that hadn't actually been built: a free-form numeric offset, distinct from the 3×3
`alignmentIndex` grid's 9 discrete positions. It composes with alignment rather than replacing it
(offset nudges on top of whichever alignment point is picked), and needed generalizing `PatternField`
to support a `px` suffix and negative values, since every prior field on this panel was a `%`-only,
0-1000-clamped percentage.

#445 is a real, user-reported bug, first spotted as a black shadow trailing a shape used as a
pattern source, then narrowed to a precise repro: type "Mama" into a text node, pattern a frame from
it, then shrink the content to "M" — the "ama" glyphs' footprint stayed behind, solid black. Root
cause: the render-target pool recycles physical textures, and both places that clear one before
drawing fresh content into it (`renderNodeListToPatternSourceTile.ts` for patterns, and the
unrelated blend-mode isolation path in `drawVectorFillGroup.ts`, fixed alongside since it's the
identical bug) enabled alpha writes _after_ `gl.clear()` instead of before — leaving a recycled
target's old alpha untouched by the clear, so old opaque pixels survived with their RGB zeroed to
black. See `.claude/docs/canvas-rendering-pipeline.md` for the full mechanism.

#446/#447 close a real, user-reported gap: while picking a pattern source, moving the cursor over the
canvas showed no feedback at all — nothing lit up under a pickable shape, unlike the default tool's
ordinary hover outline. `useHoverHighlight.ts` used to skip hover resolution entirely whenever
`isPatternSourcePicking` was armed; it now runs a dedicated resolver
(`resolvePatternSourcePickHover.ts`) that hit-tests the same way a click would and only highlights the
hit when it passes the same `doesNodeHavePatternInSubtree` eligibility check `handlePatternSourcePick.ts`
already enforces at click-time — so a node that would be refused as a source (#443) never lights up as
if it could be picked. #446 verifies the eligible case shows a highlight; #447 verifies an
already-pattern-holding node stays unhighlighted.

#448/#449 close a real coverage gap: the `image` paint type (a fifth `TPaint` variant, alongside
solid/gradient/pattern) shipped with full unit coverage for its pieces (`getOrLoadTexture`'s size
cache, `getImageFillCoverUv`'s cover-fit math, `drawVectorImageFill`'s stencil+composite draw calls,
`useConvertToImagePaint`'s commit shape) but no e2e test ever drove the real upload → paint → render
path end to end, unlike every other paint type on this page. #448 uploads a synthesized solid-color
PNG (`createSolidColorPngBuffer`, built at test time via `pngjs` rather than committing a binary
fixture) onto a non-square rectangle and asserts both the committed `fills[0]` shape
(`{type: 'image', scaleMode: 'fill'}`, `ref` a `blob:` URL) and the actual rendered pixels at two
opposite corners of the shape, proving the cover-fit crop fills the whole frame without letterboxing
or squashing. #449 reuses the same upload flow, then drags the fill row's alpha field to 50 and
asserts the sampled pixel's red channel drops accordingly — the same opacity fix described in
`.claude/docs/canvas-rendering-pipeline.md`'s image-fill section, verified here as a real rendered
effect instead of only a unit assertion on the shader-uniform call.

#450 covers the Fill panel's "Rotate 90°" button (`ImageFillModeRow.tsx`), a real feature added
alongside pattern/gradient/image's existing rotate-style controls — previously present in the UI
but with no `onClick` wired at all. It uploads a source image split vertically into two solid
colors (red/blue), so each 90° turn moves a known color to a known screen edge and is detectable by
pixel sampling, not just by reading `fills[0].rotation` from the store. Three consecutive clicks are
asserted individually (90°/180°/270°, each with both the stored value and the rendered pixels), then
two undos step back one turn at a time (not straight to the start, proving each click is its own
history entry rather than one coalesced edit) and a redo re-applies the most recently undone turn —
the "different cases" (multiple turns, undo, redo) the rotate button needed to be equipped with.

#451/#452 close out the fill-mode dropdown, whose Fit option previously did nothing beyond a local
display change. #451 uploads a square image onto a wide rectangle, switches the dropdown from Fill
to Fit, and asserts both the committed `scaleMode` and that the image's left/right margins (outside
the centered, aspect-preserved band Fit produces) no longer show the fully-opaque source color —
proving the shape actually letterboxes instead of stretching/cropping to cover. #452 covers a
related, previously-unreachable gap: switching a fill to the Image paint type used to leave the
canvas showing nothing at all until a file was uploaded, unlike every other paint type which
previews something immediately. It switches to Image without ever opening the file picker, and
asserts both that a real (empty-`ref`) image paint gets committed — not just a local UI state change
— and that the shape renders a visible checkerboard (two one-square-apart pixel samples differing),
matching the light checkerboard already used elsewhere in the picker's own transparency preview
rather than inventing a new visual language.

#453 is a real, user-reported regression: picking Fit in the dropdown, _then_ uploading a file,
rendered as Fill anyway — `useNotifyImagePanelState.ts` hardcoded `scaleMode: 'fill'` on every newly
picked image regardless of the dropdown's own current selection. Unlike #451 (which always picks
Fit _after_ an image already exists), this scenario picks Fit first and only then opens the file
picker, so it fails against the old hardcoded-`'fill'` code specifically because that ordering is
what exposed the bug — confirmed by re-running it against the reverted code before landing the fix.

#454/#455 cover the new Image-tab "position/crop editing" mode (a dashed selection outline plus 8
handles, replacing the normal solid/4-handle look while the Image tab is open on a node) by reading
`store.getState().design.imageEditor` directly via `page.evaluate`, rather than trying to distinguish
a dashed line from pixel samples. #454 opens the Image tab (before any source is even picked) and
asserts the editor targets that node in `'position'` mode, then presses Escape and asserts it clears
back to `null` while the node's own image paint is left untouched. #455 additionally drags the
shape's own top-left resize handle while the tab is open and asserts the mode flips to `'crop'` — this
one caught a real bug during development: a first implementation cleared `imageEditor` the instant the
Fill picker's popover auto-closed (which a resize-handle pointerdown does, as an "outside click"),
wiping the just-armed `'crop'` write a tick later. The fix (decoupling the sync effect's clearing from
popover-open state, relying on the node's own deselection/unmount for the "click outside the element"
exit instead) is verified the same way as every other bug fix here: this exact test failed with
`imageEditor` ending up `null` against the pre-fix code, and passes against the fix.

#456/#457 close a follow-up gap in #455: the internal `imageEditor.mode` flipping to `'crop'` on
resize didn't used to touch the Image panel's own fill-mode dropdown (Fill/Fit/Crop/Tile), so a user
resizing the shape saw the canvas outline behave like a crop but the dropdown still read "Fill" —
`useSyncFillModeWithImageEditorCrop` now drives the dropdown's local state from the same Redux
`imageEditor` value. #456 asserts the dropdown's rendered label text flips from "Fill" to "Crop" after
a resize-handle drag. #457 is the guard on the other side: manually picking "Fit" from the dropdown
while still in position mode (no resize) must not get silently overwritten back — confirmed by
reverting the fix and seeing #456 fail with the dropdown stuck on "Fill" against the pre-fix code.

#458/#459 extend crop mode with a second, independently-editable entity: once in `'crop'` mode, the
image itself (not just the frame) can be selected, dragged, resized, and rotated on its own, stored as
`TImagePaint.crop` (a world-space `{x,y,width,height,rotation}` rect, seeded from the frame's current
bounds the first time it's touched). The frame keeps its dashed/L-bracket handles only while it is the
selected target; once the image becomes selected it gets a plain solid outline with square corner
handles instead, and the frame falls back to a plain dashed guide with no handles. #458 grabs the
frame's resize handle to enter crop mode, then drags inside the shape body and asserts three things at
once: `imageEditor.selectedTarget` flips to `'image'`, the paint's `crop` rect moves by exactly the
drag delta, and the frame node's own `x`/`y` are completely untouched — proving the two entities never
pull each other. #459 covers the reverse: after the image has been dragged away from part of the frame,
clicking a point that is inside the frame but now outside the shifted image rect switches
`selectedTarget` back to `'frame'`, matching the "image has click priority when overlapping" rule.

#460-#462 are real, reported regressions found live-testing #458/#459 right after they landed. #460:
picking "Crop" from the dropdown only ever updated the panel's own local `fillMode` display state —
it never touched `imageEditor.mode` in Redux, so `armImageCropOnPointerDown` (gated on
`imageEditor.mode === 'crop'`) never armed, and dragging the image silently did nothing until the user
separately triggered a resize. Fixed in `useSetImagePaintScaleMode` by dispatching the mode flip
directly when `fillMode === 'crop'`, the same way a resize-handle grab already does. #461: reopening
the Image tab always reset `imageEditor.mode` back to `'position'` unconditionally, even when the
paint already had a stored `crop`, so the dropdown reverted to "Fill" and the frame's L-bracket
outline replaced the plain crop chrome until another resize forced it back. Fixed by seeding the
reopen dispatch from whether `paint.crop` is already set (`useSyncImageEditor`'s new `hasStoredCrop`
param, read through a ref so a crop committed mid-drag can't retrigger the effect and reset
`selectedTarget`). #462: the image's own resize/rotate handles never got a hover cursor at all —
`resolveResizeHover`/`resolveRotateHover` only ever tested the frame's handles. Fixed by adding
`resolveImageCropResizeHover`/`resolveImageCropRotateHover` to the same `HOVER_RESOLVERS` chain, gated
on `selectedTarget === 'image'`. This test also caught (and works around) a real quirk in the shared
`createCursorRotator` utility: a cursor kind's PNG loads lazily on first use, so the very first hover
onto a cursor kind that hasn't been requested yet in the session can resolve to no cursor until the
image finishes loading — real continuous mouse movement papers over this by re-triggering hover
resolution many times per second, but a scripted instant jump does not, so the test nudges the pointer
again after a short wait, the same way organic mouse movement would.

#463/#465 close the same gap for the two fill types that support a mirror-resize crossing: dragging
a Rectangle or Frame's resize handle past the anchor on either axis toggles `flipX`/`flipY` on the
fill's own paint (`getMirroredFills` in `resizeBoxNode.ts`), since neither node type carries a native
flip field of its own (`isFlippableNode` only lists Ellipse/Media/Polygon/Star/Text). #463 is a real,
reported regression: the mirror computed the flipped value once per drag from a per-drag "original
fills" cache, but skipped re-dispatching it whenever the freshly-computed value happened to equal the
cached original — correct on the way out, but on the way back in (crossing the anchor a second time
within the same drag), the live store's flip had already diverged from that cached original, so the
skip left a stale `flipX: true` in place forever ("Zrobię -x albo -y i jest git ale gdy odbijam
spowrotem to się jebie"). Fixed by making the fills computation always reassert its computed value
instead of ever skipping the dispatch. #465 extends the identical mechanism to `TPatternPaint`
(previously no flip support at any level — no field, no shader uniform), adding `flipX`/`flipY` to
the paint type, a `u_flipX`/`u_flipY` uniform mirroring the tile UV in
`patternSourceTileFragmentShaderSource.ts`, and widening `resizeBoxNode.ts`'s mirror check to cover
both fill types.

#464 is a genuine rendering bug found by asking the user (already live-testing #463) to check the
browser console: two shapes with image fills, only the first one showing, the second staying blank.
Root cause was global WebGL state, not a data/Redux issue — `enableVertexAttribArray`/
`disableVertexAttribArray` persist across draw calls and shader programs until explicitly changed, so
`drawImageTexture.ts`'s stencil-mask pass (using only `a_position`, a small buffer) failed its
buffer-size validation (`GL_INVALID_OPERATION`) whenever `a_texCoord` (used only by the later
content-quad pass, a larger interleaved buffer) had been left enabled by a previous image draw
anywhere in the scene. Fixed with a single `gl.disableVertexAttribArray(texCoordLocation)` before the
stencil-mask pass.

#466/#467 close a click-routing gap opened by crop mode's own move/resize distinction (#458/#459
above): clicking a different node entirely while the Image editor was open used to fall straight
through to the normal selection resolvers, since neither `armImageCropOnPointerDown` (gated to
`mode === 'crop'` only) nor the empty-canvas-only `armExitImageEditorOnPointerDown` had ever covered
"hit something, but not our own node." #467 covers crop mode: the resolver now exits the editor and
claims the pointerdown itself whenever the click isn't on the crop node's own body or one of its
resize/rotate handles — the handle carve-out is the interesting part, caught by a follow-up
regression before it shipped: the rotate ring sits 6-16px outside a node's own bounding box by
design, so an early version of this fix mistook grabbing the frame's own rotate handle for "clicked
elsewhere" and exited crop mode before the rotation could even start. #466 widens the identical guard
to the simpler `'position'` mode (Image tab open, no crop yet), which had no exit-on-miss logic at
all before this.

#468/#469 extend crop mode's frame/image independence (#458 above, "the two entities never pull each
other") from move drags to rotate and resize: rotating or resizing the frame on canvas while its own
image editor is active in `'crop'` mode must leave the crop rect's position/size/rotation exactly as
it was, the same way moving the frame already did. `rotateNodesRigidly`'s per-tick crop-rotation and
`resizeBoxNode`'s per-tick crop-scaling both gained a check against `state.design.imageEditor` (skip
touching the fill at `imageEditor.paintIndex` whenever `imageEditor.nodeId === id`). #469's title says
"again" deliberately: the very first resize that transitions an image from `'position'` to `'crop'`
mode must still scale the newly-seeded crop to match the frame (that's what establishes the crop in
the first place, per #455 above) — only a subsequent, separate resize while already in crop mode
should decouple. This surfaced a real ordering bug during development: `armResizeOnPointerDown` used
to flip `imageEditor.mode` to `'crop'` at arm time (pointerdown, before the drag even runs), so by
the time the transition drag's own `resizeBoxNode` ticks ran, the mode had already flipped and the
new skip-guard suppressed the very scaling that transition needed — fixed by moving the mode flip to
`disarmResizeDrag` (pointerup, once the resize is actually done) instead.

#470 is the deliberate exception to #468: the right panel's own "Rotate 90°" button
(`rotateNodesRigidly`, shared between the button and the keyboard shortcut) is explicitly not given
the #468 guard, since panel-driven transform fields are expected to keep the crop in lockstep with
the frame the same way the panel's X/Y and Dimensions fields already do ("tak też działa to w
Figmie") — only a canvas rotate-handle drag (`continueRotateDrag.ts`, a distinct call path) decouples
them. Confirmed by the user hitting the opposite of #468: clicking the panel's rotate button left the
crop behind, which turned out to be #468's own crop-decoupling guard incorrectly applying to a call
site it was never meant to cover.

#471 wires the ImageCrop panel's Dimensions row (`ColumnDimensions`, reused as-is from the
Frame/Rectangle panel) to force `locked: true` and disable the toggle whenever an image crop is being
edited (`useColumnDimensions`), since a crop's own aspect ratio should always stay fixed when resized
from the panel, unlike a node's optional lock. This exposed a dead code path: `commitColumnWidth`/
`commitColumnHeight`'s image-crop branch (`commitImageCropDimensions`) had never actually read a
`locked` flag at all — editing width while an image crop was active always left height untouched
regardless. Fixed by running the crop's own width/height through the same
`getLockedDimensionsChanges` ratio math the node path already used, with `locked` hardcoded `true`
for this branch.

#472 closes the last of the panel's shared Rotation-row controls: the Flip horizontal/vertical
buttons (`buildRotationButtons.tsx`) had already been made crop-aware for Rotate (#470's
`rotateImageCropRigidly`) but not for Flip, so clicking them while editing an image crop still
flipped the frame via `handleFlipSelection`, and the buttons were disabled or enabled based purely on
the frame's own layout state (`isLayoutContainerNode`), unrelated to whether an image crop was even
being edited. Fixed with a new `flipImageCropRigidly.ts` (the flip counterpart to the existing
`rotateImageCropRigidly.ts`), toggling the paint's own `flipX`/`flipY` directly, and re-enabling the
buttons unconditionally whenever an image crop is being edited.

The dedicated `ImageCrop` panel component itself (`PanelProperties/ImageCrop/`, swapped in by
`PanelProperties.tsx` whenever `selectSelectedImageCrop` returns a value, i.e.
`imageEditor.selectedTarget === 'image'`) has no scenario number of its own — it's a pure
presentational reshuffle (a plain "Image" header instead of the Frame/Rectangle dropdown, the shared
`ColumnPosition`/`ColumnRotation` without `ColumnAlignment`, plus the Dimensions row from #471) with
no new interaction logic beyond #466-#472 above, covered by `PanelProperties.spec.tsx`'s own render
assertions rather than a numbered e2e scenario. Building it surfaced one real bug worth recording
without a number: swapping the top-level panel component on every `selectedTarget` change unmounted
and remounted `FillRow` (the sole owner of `useSyncImageEditor`), whose unconditional
clear-`imageEditor`-on-unmount cleanup fired on that remount and silently exited crop mode the instant
the image was selected. Fixed by making the cleanup check whether the node is still selected
(`selectSelectedNodes`) before clearing, and by tracking "did this hook instance ever actually
activate the editor" (`wasActiveRef`) so a fresh mount that lands on an already-active `imageEditor`
doesn't immediately clear it either.

#482's `ImageEditToolbar` (`Toolbar/ImageEditToolbar/`) is a shell only — it shows above the canvas
toolbar (same offset as `VectorEditToolbar`, reusing the generic `ToolbarButton`/`ToolbarDropdown`)
whenever the selected node has at least one fill of type `image` (`useImageEditToolbar`, guarded by
`vectorEditingNodeIds.length === 0` so it never overlaps `VectorEditToolbar`). Crop/Remove
background/Edit with prompt and the More dropdown's Expand/Boost resolution/Vectorize are all
no-ops for now; Select area only toggles its own local `isSelectAreaActive` state (no store write,
no real selection behavior) — wiring real functionality for each is a separate follow-up. #483 adds
one more guard: `useImageEditToolbar` also reads `selectImageEditor` and hides while
`imageEditor?.mode === 'crop'`, since that's when the dedicated `ImageCrop` panel/crop handles take
over the same on-canvas area — position and tile mode leave it visible, only crop mode hides it.

#484 is a related but separate bug: tile and crop are mutually exclusive concepts on a
`TImagePaint` (tile wraps the texture via `scaleMode: 'tile'` + `scale`; crop draws a fixed
`crop` rect), but nothing enforced that — picking Crop right after Tile (or resizing a
tile-mode shape, which auto-enters crop via `disarmResizeDrag.ts`'s
`commitImageEditorCropModeTransition`) left the paint with `scaleMode: 'tile'` **and** a freshly
seeded `crop` at the same time, so `drawImageTexture.ts` applied tile UV-wrapping _inside_ the
crop quad — a visible "double-exposure" ghosting artifact, confirmed live. Root cause:
`seedImageCropIfNeeded.ts` (the single function both the dropdown's `enterImageCropMode` and the
resize-handle's `armResizeOnPointerDown.ts` call to seed a crop rect) only ever wrote `crop`,
never touching `scaleMode`/`scale`. Fixed there once, covering both entry paths: when seeding a
crop for a paint whose `scaleMode` is still `'tile'`, it now also resets `scaleMode` to `'fill'`
and clears `scale` in the same dispatch, and uses the corrected paint when computing the seeded
crop rect itself (so it gets the natural-image cover-sizing logic instead of tile's frame-sized
fallback).

#485's `ImageCropExpandButtonOverlay` (`Canvas/ImageCropExpandButtonOverlay/`) is a plain HTML
overlay (a `UITools.Button`, not a canvas draw call) shown only while `imageEditor?.mode ===
'crop'`, positioned via `getImageCropExpandButtonPosition.ts` — the frame's own bounds/rotation
converted to a screen point inset from its bottom-right corner (`worldToScreen` + `rotatePoint`
around the bounds center, same pattern as `getEllipseArcValueLabelAnchor.ts`), so it tracks
rotation and stays a constant screen-space inset regardless of zoom. It has no real action wired
up yet. Building it surfaced a real conflict worth recording: the button's own hit area visually
sits right where the frame/crop resize handle is grabbed from, and an early version (centered
exactly on the corner) made an existing resize-at-that-corner e2e test start failing, because the
real HTML button now intercepted the pointerdown before it ever reached the canvas. Fixed by
giving the overlay `pointer-events: none` — it stays purely decorative until Expand gets a real
handler, at which point this will need a proper resolution (e.g. shrinking/relocating the resize
handle's own hit zone near that corner, or making the button itself part of the hit-test
resolution order).

#486 is the Image edit toolbar's own Crop button gaining a real handler
(`useHandleCropClick.ts`), following a three-rule priority for _which_ fill it targets, decided
with the user up front: (a) with no fill row selected in the right panel, target the first (topmost)
fill that is an image; (b) with one or more fill rows selected, target the selected one that is an
image; (c) if a fill row is selected but none of the selected rows is an image, fall back to (a).
The branching itself is a pure function, `getCropTargetPaintIndex.ts` (`fills`, `selectedIndices`)
→ index, fully covered by unit tests — the e2e scenario only proves the real click reaches it.
Once the target index is resolved, it reuses the exact same `setImageEditor` +
`seedImageCropIfNeeded` pairing #482–#485 already established, so an existing crop's position is
never reset, only entered for editing.

This surfaced a real architecture gap: `FillRow`'s own selection highlight (`selectedIndices` from
`useFillSelection`) used to be pure local `useState` inside `FillSection` (`RightPanel`), with no
way for a Canvas-side component (`ImageEditToolbar`) to read it. Fixed by lifting it into Redux as
`TDesignPage.selectedFillIndices` (per-page, alongside `selectedIds`) — `useFillSelection` now
reads/writes it directly via `useAppSelector`/`dispatch` instead of local state, keeping its exact
same external hook API so no caller needed to change. The field is optional on `TDesignPage`
(`selectedFillIndices?: number[]`, defaulted to `[]` by the selector) specifically to avoid a
mass update across the dozens of test fixtures across the codebase that construct a `TDesignPage`
by hand — the same technique already used for `imageFillPickerFocus` and other transient fields on
`TDesignState` itself. Like `vectorEditingNodeIds`/`imageEditor`, it's excluded from undo/redo
snapshots (`handleReplaceDesignSnapshot.ts` never touches it), since it's transient UI selection,
not document content.

#487 is a real, pre-existing bug reported live by the user, unrelated to the #486 work above:
with two image fills on the same node, entering crop/image-focus mode on the first, exiting back to
the fill list, then opening the second fill's Image tab could leave edits landing on the first fill
instead. It turned out to be one symptom of a much bigger gap: **no two `FillRow` popovers ever had
real mutual exclusion, for any fill type, not just images** — confirmed live via a throwaway
Playwright script reading `store.getState()`, which caught two "Image" tab buttons existing in the
DOM at once (one still `aria-pressed="true"` from a never-actually-closed sibling popover).

Two intermediate fixes were tried and discarded before the real one landed, each one a genuine
regression the user caught live ("jest jeszcze gorzej" / "dalej są widoczne 2 panele"):

1. A `key`-based forced remount, scoped to `imageFillPickerFocus` only. Failed from a React 18
   StrictMode interaction (the same hazard class already documented for `skipInitialArm` above):
   forcing an unmount/remount mid-click raced Radix's own dismissable-layer/outside-click handling,
   closing _both_ fills' popovers instead of just the stale one.
2. A `forceCloseSignal?: number` prop toggling `ColorPicker`'s controlled `open` via
   `handleOpenChange`. This avoided the remount race, but its consuming effect depended on
   `handleOpenChange` in its dependency array — an unmemoized closure recreated on every render — so
   once a fill was force-closed even once, the effect re-fired on every subsequent unrelated render
   forever, permanently snapping it shut. A fill that had ever lost focus once could never be
   reopened again for the rest of the session.

The user's own diagnosis, after both attempts failed, was the fix: stop trying to reactively
_signal_ a close and instead make it structurally impossible for two popovers to coexist. The final
design, in `FillSection`/`FillRow`:

- `FillSection` owns one `openPickerIndex: number | null`
  (`hooks/useFillSection/hooks/useOpenPickerIndex/`), seeded at mount from `imageFillPickerFocus` so
  the resume-after-ImageCrop-swap case still works, generalized to _every_ fill type (not just
  images) since the coexistence bug was never image-specific.
- Each `FillRow` computes `isPickerOpen = paintIndex === openPickerIndex` — a **derived** value.
  A single number literally cannot equal two different indices, so at most one row can ever be open.
- `ColorPickerInput` already had an unused-by-`FillRow` escape hatch, `onTriggerClick` (used by
  `StopRow.tsx` for its own docked-panel pattern), which renders a plain static swatch button and
  mounts _no_ `ColorPicker`/`Popover` at all. `FillRow` now passes
  `onTriggerClick={isPickerOpen ? undefined : () => onPickerOpenChange(true)}` — a closed row
  genuinely has no `ColorPicker` component instance in the tree; the owning row mounts a fresh one
  with `initialOpen={true}`. Switching fills is an ordinary unmount-of-old/mount-of-new via React's
  own reconciliation (different element types in the same JSX slot) — no `key`, no signal, no custom
  close mechanism, and no way for two instances to ever coexist.

This fully replaced (and made unnecessary) both `useClosePickerWhenFocusMovesAway`'s hadFocusRef
race-guard and `useForceClosePicker` — deleted along with the `forceCloseSignal` prop plumbing.

#488 surfaced while re-verifying the Crop button (#486) against the new architecture: with fill row 1
genuinely selected in the panel, clicking Crop still targeted fill 0. Root cause:
`useClearFillSelectionOnOutsideClick`'s window `mousedown` listener (used to deselect a fill row when
clicking away from the panel) fired _before_ the Crop button's own `click` handler ever read
`selectedFillIndices`, since `mousedown` always precedes `click` in the same interaction — by the
time the crop handler ran, the selection it wanted to read had already been cleared. Fixed narrowly:
`ImageEditToolbar`'s Crop button gained an `onMouseDown` (`useStopCropMouseDownPropagation.ts`,
`ToolbarButton` grew the prop to carry it) that calls `stopPropagation()`, preventing that mousedown
from ever reaching the window listener — the exact same idiom `useStopRowSelectPropagation.ts`
already uses elsewhere in this codebase for an analogous "don't let an outer container's click
side-effect fire" problem.

#489, also surfaced while stress-testing #487's fix: switching the picker to a fill that was left in
Tile mode, then switching to a plain solid fill, left the canvas-facing `imageEditor` Redux state
stuck showing `{mode: 'tile', ...}` from the fill that was no longer even open. Root cause: `FillRow`'s
`isImageTabActive` is local state fed by `ColorPicker`'s `onImageTabActiveChange` callback — but once
a row's `ColorPicker` unmounts (per #487's fix, because another row took over), that callback stops
firing entirely, freezing `isImageTabActive` at whatever it last was. `useSyncImageEditor`'s
deactivate branch requires `isImageTabActive` to go `false` to clear `imageEditor`, so a row stuck at
`true` forever blocked it. Fixed with `useDeactivateImageTabOnPickerClose.ts`: resets
`isImageTabActive` to `false` the instant `isPickerOpen` (now derived from `openPickerIndex`) goes
false — safe under the new architecture specifically because the one scenario that used to need
`isImageTabActive` to _survive_ a momentary close (continuing a canvas resize-drag) no longer works
by toggling `isPickerOpen` on a still-mounted `FillRow` at all; it works by swapping the whole
`FillSection` out for the dedicated `ImageCrop` panel view, which unmounts everything and reseeds
`openPickerIndex` from `imageFillPickerFocus` on the way back.

#490 is a feature-parity request, not a bug in shipped behavior: clicking the canvas while the Image
editor is active already exits it (`armExitImageEditorOnPointerDown.ts`, a canvas-pointerdown
resolver), but clicking elsewhere in the right panel (e.g. the Position/Opacity fields) did nothing —
`imageEditor` stayed active with nothing on canvas to show for it. Fixed with a new hook,
`useExitImageEditorOnPanelClick.ts`, added alongside the existing
`useClearFillSelectionOnOutsideClick.ts` in `useFillSection`'s hook set and following the exact same
shape (a `window` `mousedown` listener, gated on `isImageEditorActive` the way the sibling hook gates
on `hasSelection`). It dispatches `setImageEditor(null)` when a click lands outside the fill list
container but _inside_ the right panel — checked via `event.target.closest('[class*="RightPanel_"]')`
(the CSS-module-generated root class), which is the deciding condition: without it, this would also
fire on every canvas click (canvas is likewise "outside the fill list"), redundantly racing the
canvas's own resolver and risking exiting the editor on clicks meant to interact with the crop/resize
handles themselves. The scoping bug that shipped for the first e2e run (`RightPanel_RightPanel`,
assuming the same doubled-name convention as `ColorPicker__popover`'s independently-hashed BEM
classes) rather than the project's actual flat `_RightPanel_<hash>_<n>` module-class format — caught
immediately by the new e2e test, not a live report.

A follow-up gap the user caught live right after: the hook only handled the editor-exit half of
canvas parity, not the second stage. On canvas, a first click outside exits the editor but keeps the
picker panel open (the pre-existing "two-stage" test), and a second click goes further; on the right
panel, a second click did nothing once `imageEditor` was already `null` — the picker stayed stuck
open with no way to close it from the panel. Fixed by widening `useExitImageEditorOnPanelClick` to
take both `isImageEditorActive` and `isPickerOpen` (`openPickerIndex !== null`) and perform at most
one action per click — `onExitImageEditor` takes priority, `onClosePicker` only fires once the editor
is already inactive — so exiting the editor and closing the picker are always two separate clicks,
never collapsed into one.

#491 is the largest, most consequential bug found this round, reported live with an exact repro:
three image fills, each already carrying its own committed crop. Clicking through 0 → 1 → 2 each
correctly enters crop mode, but clicking back to 0 or 1 afterward lands on `imageEditor: null` —
crop mode stops working entirely for that fill, even though its `paint.crop` is untouched. The
user's own diagnosis nailed the mechanism before the fix was even written: "jakby wyższy fill
rozpieprza niższy" (as if the higher fill wrecks the lower one).

Root cause: `useSyncImageEditor`, `useSyncGradientEditor`, and `useSyncPatternSourcePickTarget` each
run once per `FillRow`, syncing that row's local open/active state into shared global Redux state
(`imageEditor`/`imageFillPickerFocus`, `gradientEditor`, `patternSourcePickTarget`). All three had
the identical flaw: their deactivate branch (and unmount cleanup) unconditionally dispatched `null`
whenever _this_ row's own state went inactive, without checking whether the shared state still
actually belonged to this row. Since every `FillRow`'s `isPickerOpen` is derived from one shared
`openPickerIndex` (see #487), switching from fill 1 to fill 0 flips _both_ rows' `isPickerOpen` in
the _same_ render commit. React runs effects in tree order: fill 0 (lower index, rendered first)
activates and correctly claims the state — then fill 1's deactivation fires immediately after, in
the same flush, and unconditionally nulls whatever is there, clobbering fill 0's fresh claim a
moment after it was set.

Fixed identically in all three hooks: before dispatching `null`, read the current value back via
`store.getState()` and only clear it if it still matches _this_ row's own `(nodeId, paintIndex)`.
`useSyncImageEditor`'s version of the check appeared twice (deactivate branch and unmount cleanup)
and was pulled into `useSyncImageEditor/utils/clearOwnedImageEditorState.ts` — the user caught the
duplication directly ("ta logika się powtarza zrób na to funkcje") — which also prompted promoting
`useSyncImageEditor.ts` out of the flat `FillRow/hooks/` folder into its own `useSyncImageEditor/`
folder, per the established "a hook with its own utils gets its own folder" convention.

A real trap surfaced while writing the regression tests: a `renderHook` test that mounts fill 1,
_separately_ mounts fill 0, then reruns fill 1's own `rerender` does **not** reproduce the race —
each of those calls is its own sequential `act()` flush, not an interleaved same-commit update, so a
test built that way can pass against both the buggy and the fixed code. The only test shape that
actually exercises the real ordering is a single composite hook calling _both_ rows' sync hook
unconditionally (mirroring how `FillSection` renders every `FillRow` on every render) and changing
which one is active via one shared prop in one `rerender` call — see the last test in each of
`useSyncImageEditor.spec.tsx`/`useSyncGradientEditor.spec.tsx`/`useSyncPatternSourcePickTarget.spec.tsx`
for the pattern. Confirmed via the standard stash/pop check: reverting just the ownership-check
addition makes all three regression tests — and the live e2e reproduction of the exact repro,
cycling 0→1→2→0→1 — fail exactly as described, with every other pre-existing test in each file
still passing.

#492 is a new feature, not a bug fix — but it took three rounds of live correction against the first
implementation to land on the real spec, so those corrections are recorded here alongside it.
`ImageCropToolbar`'s "Crop" label + slider (canvas toolbar, shown while `imageEditor.mode === 'crop'`)
previously had no real geometry behind it — a local `useState` shell with no store read/write. Figma's
own docs don't document the slider's mechanics, so the user supplied the spec directly. The first
version (locked via `AskUserQuestion`) used 0% = Fill/**cover** size, anchored on the frame's own
center — tested only against a square node + square image, where cover and contain are numerically
identical, which hid the mistake. The user then supplied a screenshot of Figma's own crop UI on a
portrait photo and pushed back: cover's defining trait (the non-locked axis overflowing) is exactly
what the screenshot showed, and that's what was wrong. After a rejected intermediate attempt that
branched on `paint.scaleMode === 'fit'` (plausible, matched `getImageCropRect.ts`'s own existing seed
branch, but still overflowed for the common default `scaleMode: 'fill'` case — the user's exact
words: "dalej nie działa"), the fix landed: 0% is **unconditionally** the Fit/**contain** size, and
this toolbar always reasons in Fit terms regardless of the paint's own Fill/Fit choice elsewhere.
Separately, the user caught the anchor snapping the image back to the frame's center even after they'd
manually dragged it off-center — fixed by anchoring on the crop's own current center instead of the
frame's. See `properties-panel.md`'s `ImageCropToolbar` section for the full narrative and the new
pure utils (`getEffectiveImageSize`, `getImageCropZoomPercent`, `computeImageCropZoomRect`,
`commitImageCropZoom`, `selectImageCropTarget`).

A fourth correction followed a false step in the other direction: an intermediate pass also forced
`seedImageCropIfNeeded.ts` (used by every crop-mode-entry path, not just this toolbar) to always seed
the Fit/contain rect, on the reasoning that "never overflow" should hold from the very first frame. The
user reversed this immediately upon seeing it live ("czemu jak wybieram opcje crop to mi robi fit do
node?" — why does picking Crop force a fit to the node?), then nailed the actual rule: "To musi się
dostosować do zdjęcia, nie może być takiej zmiany" (it must adapt to the image, there can't be a change
like that) — entering crop mode must never alter how the image currently looks; only the **slider**, once
actually touched, reasons in Fit terms. Reverted `seedImageCropIfNeeded.ts` back to delegating to
`getImageCropRect.ts`'s own scaleMode-aware `seedFromNaturalSize`, exactly as it was before this whole
feature — so opening crop mode is a pure no-op on the image's appearance, regardless of scaleMode.

e2e coverage, three tests: (1) the basic 0→100%→0 sweep on a square node + square image; (2) confirming
entering crop mode with a default Fill-mode paint leaves the (overflowing) crop exactly as it already
was — no forced fit — and that only _dragging the slider to 0%_ produces the non-overflowing Fit/contain
size; (3) dragging the image off-center via a canvas pointer-drag before ever touching the slider, then
confirming the zoomed crop stays centered on that dragged position rather than snapping back to the
frame's center. All three confirmed to genuinely fail against their respective pre-fix implementations
via backup-file round-trips (edit → rerun → confirm failure → restore).

#493 wires up `ImageCropAspectRatioMenu` (the dropdown next to the zoom slider, same toolbar as #492) —
another pure UI shell with no `onClick`/`selected` logic at all. The user specified it tersely
("Node się centruje wtedy względem zdjęcia... checki są poprzez sprawdzenie wartości aktualnego frame
względem zdjęcia, nie zapisujemy żadnych stanów") and, after an over-cautious clarifying question was
rejected outright ("Napisałem Ci już o co chodzi... czego nie rozumiesz?"), the direct reading held:
"Original" resizes the node to the paint's real native pixel dimensions; every ratio preset (Square/
Circle, Landscape/Portrait) resizes the node to the largest rect of that ratio fitting _inside_ the
current crop rect (reusing `getImageFillContainRect` with the crop as bounds instead of the node); both
cases center the resulting node on the crop's own current center. No selection state is stored anywhere
— each menu item independently recomputes its own target rect and compares it against the node's actual
current geometry to decide its own checkmark. See `properties-panel.md`'s `ImageCropAspectRatioMenu`
section for the full file breakdown.

Two follow-up corrections landed right after the first pass. First, Circle needed an actual corner
radius to be distinguishable from Square at all (both resolve the identical 1:1 rect) —
`ASPECT_RATIO_CIRCLE` carries `cornerRadius: 'max'`, resolved via the existing `getMaxCornerRadius`
util. The first version of this only set `cornerRadius` when a preset explicitly asked for it, leaving
it **untouched** otherwise — so picking Circle then Square left the shape still rounded, caught live by
the user ("Kurwaaa square ma radius usuwać" — Square must clear the radius). Fixed by always including
`cornerRadius` in the dispatched changes (max for Circle, `0` for everything else), so it's never
ambiguous or carried over from a prior pick. Second, "Custom" now shows checked exactly when no fixed
preset matches ("Custom jest check wtedy kiedy żadna z opcji nie pasuje") — `useImageCropAspectRatioMenu`
derives `isCustomActive` as "none of `ASPECT_RATIO_PRESETS` are active," reusing the same preset list
the menu itself renders from.

e2e coverage, three tests: picking "Square (1:1)" on a 200×100 node with a square source image, switched
to Fit mode first (so — per the seed-revert above — the crop seeds to the non-overflowing 100×100
contain rect rather than an overflowing cover rect) confirms the node shrinks to exactly 100×100,
staying centered on the _original_ node's own center; picking "Circle (1:1)" under the same setup
confirms it also picks up a corner radius of exactly 50, and that picking "Square" straight afterward
squares the corners off again (the exact regression above); picking "Original" with a distinctively-sized
300×150 source image confirms the node resizes to that exact pixel size. All confirmed to genuinely fail
against their respective pre-fix states via a backup-file round-trip.

#494 is a real, user-reported regression in the Image edit toolbar's Crop button, one layer beneath
#461 (which fixed Crop targeting the `selectedFillIndices`-selected row instead of always fill 0):
opening a fill row's picker and that row being "selected" turned out to be two entirely separate pieces
of state (`imageFillPickerFocus` vs `selectedFillIndices`) — so with fill row 1's picker open but a
stale/different `selectedFillIndices`, Crop still landed on fill 0. The user's report: "Crop wejście w
ten tryb jeśli mam otwarty panel z fill pozycją index 1 i jest image to wybiera crop na fill z pozycją 0. Powinien uwzględnić jeszcze otwarty panel aktualny jeśli jest image." Fixed by adding an
`openPickerIndex` parameter to `getCropTargetPaintIndex.ts`, sourced from `selectImageFillPickerFocus`
in `useHandleCropClick.ts`. The user also corrected the priority order live ("switch"): the open picker
must be checked **before** `selectedFillIndices`, not after — an open picker is a stronger signal of
current intent than a possibly-stale selection. See `properties-panel.md`'s `getCropTargetPaintIndex.ts`
note for the full breakdown.

e2e coverage: switches a second fill to Image and leaves its picker open (without ever clicking that
row's own strip to "select" it), then confirms clicking Crop targets that open-picker row (index 1),
not the fallback (index 0) — confirmed to genuinely fail against the pre-fix version via a backup-file
round-trip.

#495 wires up the `ImageCropToolbar`'s "Fit" button (`FitLayout` icon) — another pure UI shell with no
`onClick` at all. Unlike every option in `ImageCropAspectRatioMenu` (#493), this one has no ratio math:
the user's own framing was "Przycisk fit dostosowuje node do zdjęcia" (the Fit button adjusts the node
to the image) and, after a targeted clarifying question about how "current" should apply, "Do tego co
jest aktualnie" (to whatever is currently there) — i.e. resize the node to exactly match the image's
current crop rect, whatever shape/size that happens to be right now. Implemented as
`commitFitNodeToImage.ts`: read the current crop via `getImageCropRect(node, paint)` and dispatch its
`x/y/width/height` straight onto the node unchanged, no interpolation or centering needed since the
crop rect already is what the node's new bounds should be.

e2e coverage: drags the image (not the frame) by `(20, 20)` while in crop mode, then clicks Fit and
confirms the node moves to exactly match the dragged crop rect — confirmed to genuinely fail (node
stays at its pre-drag position) against the pre-wiring shell via a backup-file round-trip.

#496 wires up the `ImageCropToolbar`'s Confirm (check icon) button — the last dead control in this
toolbar's original UI shell. The user's own framing: "Przycisk check zamyka crop ten ostatni tzn.
wychodzi z edycji" (the check button closes crop, this last one, i.e. exits editing). No geometry
involved at all — `useHandleConfirmClick.ts` just dispatches `setImageEditor(null)`, the same call
`useHandleExitImageEditor.ts` already uses to leave the Image editor from the FillSection panel side.
The Cancel button beside it stays unwired — out of scope for this fix.

e2e coverage: enters crop mode, clicks Confirm, and asserts `imageEditor` becomes `null` and the crop
toolbar is replaced by the Image edit toolbar's own Crop button again — confirmed to genuinely fail
(editor stays in crop mode) against the pre-wiring shell via a backup-file round-trip.

#497 wires up the `ImageCropToolbar`'s Cancel button, matching Figma: it discards every change made
during the crop session, restoring the node to exactly how it looked before Crop was ever clicked
("Figma robi tak że cofa poprzedni ruch wykonany cropa"). The user's first idea (reuse the app's own
undo/redo stack, `store/history/`) was walked back once we reasoned through it together: popping
`historyStack.undo()` N times would also unwind any unrelated action that landed on the stack in
between, with no reliable way to know how many steps to pop. Instead, the fix reuses only the _shape_
of undo/redo's mechanism (snapshot now, restore later) but scoped to the single node being cropped,
since every crop-session mutation — the zoom slider, aspect-ratio presets, Fit, and every canvas-drag
resolver — only ever touches that one node's `fills`/`x`/`y`/`width`/`height`/`cornerRadius`.

The user then pressure-tested the design before agreeing to it, asking directly: what about switching
to a different image mid-crop, exiting the editor some other way, or a sudden dropdown change — "Czy
przewidziałeś to?" The switching-image case turned out to be a non-issue (a whole-node snapshot reverts
that too, for free); the other two are non-issues by design (only the Cancel button itself triggers a
restore — every other exit path keeps behaving as an implicit confirm, unchanged). But the user's
underlying complaint was sharper than any single case: crop mode can be entered from five-plus different
call sites (`useHandleCropClick`, `useSetImagePaintScaleMode`, `disarmResizeDrag`, `useSyncImageEditor`,
the fill-mode dropdown), and the crop _target_ can change mid-session too (switching which fill row's
picker is open while still in crop mode) — capturing the snapshot at any one call site would be exactly
the scattered, easy-to-miss-a-spot code the user called out ("kurwa syf jest w twoim kodzie... to jest
nieskalowalny kod"). The fix: capture it centrally, inside the `setImageEditor` reducer itself
(`store/design/utils/handleSetImageEditor.ts`), which sees both the previous and next `imageEditor`
value on every dispatch and decides in one place whether this is "entering crop for a new target" — none
of the five-plus call sites needed to change or even know the field exists. See `properties-panel.md`'s
Cancel-button section for the full mechanics.

e2e coverage: enters crop mode, picks Circle from the aspect ratio menu (a real geometry change), clicks
Cancel, and asserts the node is back to its exact pre-crop `x/y/width/height/cornerRadius` — confirmed
to genuinely fail two different ways via backup-file round-trips: with the Cancel button unwired
(nothing happens), and separately with the reducer's snapshot capture reverted to a plain assignment
(Cancel exits but the node keeps its post-edit geometry). Also required loosening two pre-existing e2e
assertions (`toEqual` → `toMatchObject` on `imageEditor`) that predated this feature and didn't expect
the new `cropCancelSnapshot` field to be present once a real node is targeted.

#498 adds a new `video` paint type (`TVideoPaint`), 1:1 with Image everywhere except two elements the
user explicitly cut: the adjustment sliders (`ImageAdjustmentSliders`) and the canvas-floating base
`ImageEditToolbar` (the one with the Fill/Fit/Crop/Tile dropdown + its own Crop button) — that toolbar
never shows for a video-only fill. Everything else — the picker's own Fill/Fit/Crop/Tile dropdown, the
crop-mode `ImageCropToolbar` (zoom/aspect ratio/Fit/Cancel/Confirm), the right-panel Crop panel, and
canvas-drag crop editing (drag/resize/rotate the video inside its frame) — all work for video exactly
as they do for image. See `.claude/docs/video-fill.md` for the full file-by-file breakdown (30+ files
widened from `paint.type === 'image'` to also accept `'video'`, versus the handful that needed a
genuinely new `'video'` branch). Real video pixel rendering is deliberately out of scope for now — a
video paint draws as a flat gray placeholder on canvas, since building actual `<video>` → WebGL texture
decoding is a separate, sizable subsystem the user never asked for; only editing-UI parity was in scope.

The user pressure-tested the scope hard before landing here — several rounds of correction on exactly
which toolbar disappears ("Toolbar nie bedzie" → "Ale toolbar ten podstawowy bez niego" → "trybu crop...
ten ma być" → "1:1 z image - znika tylko ten podstawowy toolbar ale [tryb] crop [mode] zostaje i znikają
slidery do saturation itd.") — the final, authoritative statement is what's implemented: only the base
toolbar and the adjustment sliders are gone; everything else, including the crop-mode toolbar, stays.

e2e coverage, two tests: picking the Video tab turns the node's fill into a real `type: 'video'` paint
(mirroring how selecting Image converts the paint) and shows the Video panel's own upload button;
picking "Crop" from the picker's own dropdown on a video fill enters crop mode and shows the full
crop-mode toolbar (slider, Fit, Cancel, Confirm), while confirming the base Image-edit toolbar's Crop
button never appears for a video-only fill. Both confirmed to genuinely fail (`getByLabel('Video')`
times out) against a version with the Video tab button removed, via a backup-file round-trip.

Note: an e2e test asserting the uploaded file's `ref` becomes a real `blob:` URL was deliberately not
written — a genuinely decodable video file can't be constructed as an inline test fixture the way
`createSolidColorPngBuffer` does for images (video containers are far more complex than raw pixel
buffers), and this repo's own pre-existing Media tool (`useDrawMediaTool`, which places a video the
same way) has never had e2e coverage of its real-video-file path either — only unit tests, mocking
`extractVideoFrame`. This is a consistent, existing boundary, not a new gap.

#499: on the user's own instruction — "Na canvas nie widać 1 klatki obrazu z wideo. Ten problem był
rozwiązany dla media" (you can't see a single frame of the video on canvas; this was already solved for
media) — video fills now render a real still frame on canvas instead of the flat gray placeholder from
#498's first pass, by reusing the exact mechanism the pre-existing Media tool already uses: extract one
frame from the video file into a PNG blob (`extractVideoFrame.ts`, moved from `useDrawMediaTool/utils/`
to the global `utils/canvas/` once it gained a second consumer) and treat that PNG as the paint's `ref`
— the entire existing image-fill WebGL pipeline then renders it with zero video-specific code. See
`.claude/docs/video-fill.md`'s "Revised after the first pass" section for the full before/after.

e2e coverage: none added specifically for the frame-extraction pixel path, for the same
non-constructible-video-fixture reason as #498 above — covered by unit tests only
(`extractVideoFrame.spec.ts`, moved and re-verified; `useVideoPanel.spec.tsx`/`VideoSourcePreview.spec.tsx`,
both updated to mock `extractVideoFrame` and assert the resulting frame URL becomes `videoUrl`/the
background image, instead of asserting a raw `URL.createObjectURL(file)` call).

#500, two smaller follow-ups from the same conversation: the right-panel Crop header now reads "Video"
instead of the hardcoded "Image" label when the crop target is a video paint (new
`useImageCropHeaderLabel.ts`, reading the already-widened `selectSelectedImageCrop`); and the
Dimensions row's aspect-ratio lock button is hidden entirely (not just disabled) whenever editing a
crop target, since `useColumnDimensions.ts` already forces it permanently locked-and-disabled there —
showing a toggle that can never be toggled served no purpose. Both are one-line-condition fixes reusing
signals (`paint.type`, `lockDisabled`) that already existed.

e2e coverage: a new test confirms the Crop header shows "Video" (not "Image") when the crop target is a
video fill; the pre-existing aspect-ratio-lock e2e test was updated from asserting the button is
"visible and disabled" to asserting neither the locked nor unlocked button variant is visible at all.
Both confirmed to genuinely fail against their pre-fix versions via backup-file round-trips.

#501 adds a new, generic `VideoPlayer` component (`shared/UITools/VideoPlayer/`) — a ButtonIcon
(Play/Pause, toggling on click) + a seek `Slider` + an elapsed-time timer (corrected from an initial
remaining-time design per direct feedback) — and wires it into the
Video panel's picker (`VideoPanel`), below the existing `VideoSourcePreview` thumbnail card. Per the
user's own instruction, this only affects the picker: "Odpalenie wideo tylko w tym panelu, canvas nic
się nie dzieje" (playback only happens in this panel; nothing happens on canvas) — the paint's `ref`
(the extracted still frame from #499) is untouched, so canvas rendering is completely unaffected.
Audio is explicitly skipped (`muted`).

The Slider gained a third variant, `'video'`, alongside `'compact'`/`'default'`: it renders no colored
progress-fill and never marks the thumb "active" (blue) — "slider który na swojej ścieżce ma te samo
tło więc niebieskiego nie ma" (a slider whose track keeps one uniform background, so there's no blue) —
only the thumb's position communicates playback progress, matching how a plain video scrubber looks.

The architecture keeps `VideoPlayer` itself purely presentational (all playback state/handlers passed
in as props), so it stays reusable outside this one picker. The actual `<video>` element and its
`useVideoPlayer` hook (owning `videoRef`/`isPlaying`/`currentTime`/`duration`/seek handlers, driven by
native `play`/`pause`/`ended`/`loadedmetadata`/`timeupdate` listeners, not by the click handler alone)
live one level up, in `VideoPanel`, and the ref is shared down into `VideoSourcePreview`, which now
renders a real, always-mounted (but `hidden` until a source exists) `<video>` tag instead of the old
`background-image`-of-a-still-frame trick — showing live, moving video during playback, per explicit
user confirmation. Keeping the `<video>` node always-mounted (rather than conditionally rendered) is
required, not cosmetic: a `ref` isn't reactive, so mounting the node later would leave `useVideoPlayer`'s
listener-attaching effect bound to a `null` element from its first (and only) run.

This required a second, until-now-unneeded field: `useVideoPanel`'s `videoSrcUrl` (a real, playable
`URL.createObjectURL(file)` of the raw picked file, revoked on replacement — same pattern as
`useImagePanel`'s `imageUrl`), alongside the pre-existing `videoUrl` (the extracted still frame, which
remains the paint's `ref`). `videoSrcUrl` only exists client-side for the file just picked in this
session — reopening the picker for an already-committed video paint has no raw source to restore
(only the extracted-frame PNG persists), so the VideoPlayer controls simply don't render then. This is
an accepted, structural limitation, not a bug — the raw video file cannot be recovered once the
FillRow unmounts.

**Regression, reported by the user right after landing and fixed the same day**: the first version of
`VideoSourcePreview.tsx` keyed the `<video>` tag's visibility and the replace-button overlay off
`videoSrcUrl` alone, dropping `videoUrl` entirely. Two real, reported symptoms: 1) right after picking a
file, the preview showed nothing (a bare `<video src>` with no `poster` stays blank until it actually
decodes/plays, unlike the old CSS-background trick which guaranteed a picture); 2) reselecting an
already-committed video node showed nothing at all, since `videoSrcUrl` is correctly `null` on reselect
and there was no fallback path. Fix: `hidden`/the overlay key off `videoUrl` again, and `videoUrl` is
also passed as the `<video>` tag's `poster` attribute, so the still frame always shows once available,
with the live playable `src` layered on top only when `videoSrcUrl` also exists.

e2e coverage: one deterministic test confirms the VideoPlayer controls (Play button, seek slider,
"00:00" timer) appear as soon as a video file is picked, and are absent before. Real playback
(clicking Play, scrubbing, watching time count up) and the poster-image regression above are unit-
tested only — through mocked `play`/`pause`/`ended`/`loadedmetadata`/`timeupdate` events and asserting
the `poster`/`src`/`hidden` attributes directly — for the same non-constructible-video-fixture reason as
#498/#499 above: a real browser can't decode the fake byte buffer this suite uses as a "video" file, so
anything depending on actual decode (metadata loading, real play/pause transitions, a real extracted
frame) isn't observable in e2e. Confirmed to genuinely fail (Play button never appears; poster/hidden
assertions fail against the pre-fix version) via backup-file round-trips.

Two more direct follow-ups landed the same day. First, the right-panel swatch (`ColorPickerInput`'s
`<Color>` trigger) now shows the video's own extracted-frame picture via `thumbnailUrl`, exactly like
an image fill's swatch already did — a first attempt used a generic "Video" icon glyph instead, which
the user rejected outright ("Czy ja mówiłem o ikonie video?" / "Analogicznie miało być" — did I say
anything about a video icon? it was supposed to be analogous [to image]); the icon prop was removed
from `Color.tsx`, not left in unused. Second, the live playable video (`videoSrcUrl`) now survives
closing/reopening the picker or deselecting/reselecting the node within the same browser tab, via a new
session-scoped `videoSrcUrlCache` (`Map<string, string>`, same bare-Map shape as the pre-existing
`imagePaintTextureSizeCache`) keyed by the extracted-frame url and written/read across mounts — see
`.claude/docs/video-fill.md` for the full reasoning on why this doesn't extend any lifetime that wasn't
already valid (the blob itself was never revoked; only the React state reference to it was being
dropped). Both fixes are unit-tested only (`ColorPickerInput.spec.tsx`, `useVideoPanel.spec.tsx`), for
the same non-constructible-video-fixture reason as everything else on this list — the underlying
mechanism (an extracted frame URL, a raw file blob URL) can't be produced from a fake e2e file either
way. Both confirmed to genuinely fail against their pre-fix versions via backup-file round-trips.

#502 adds a `BlendModeButton` to the trailing end of the fill picker's `PaintTypeRow` — Multiply,
Screen, etc. applied to a fill, "to samo zachowanie jak dla wektora" (the same behavior as the vector
tool's own per-face blend button), persisting across a paint-type switch since `blendMode` already
lived on every paint type's shared base and every `useConvertTo*Paint` hook already carried it
through. Canvas rendering needed no changes at all: `drawBoxLeafNode.ts` already draws a shape's
`fills` through the exact same `drawVectorFillGroup`/`getFaceGroupBlendMode`/`compositeBlend` path the
vector tool's own faces use, so the WebGL side had been correctly honoring `paint.blendMode` all
along — the picker simply had no control that ever set it before this. Full e2e coverage: applying
Multiply from the picker commits `fills[0].blendMode`, and switching the same fill from Solid to
Image afterward confirms it's still there. Caught before shipping, by the new e2e test itself: the
label `"Apply blend mode"` (copied and genericized from the vector tool's `"Apply blend mode to
face"`) collided with the RightPanel's pre-existing, unrelated node-level Appearance-section blend
button, which already used that exact accessible name — `getByLabel('Apply blend mode')` resolved to
two elements. Renamed to `"Apply blend mode to fill"` to disambiguate; see
`.claude/docs/properties-panel.md` for the fuller writeup, including a separate circular-import
gotcha the same change hit.

#503 adds a Figma-style contrast checker to the Solid tab of the fill picker (details in
`.claude/docs/properties-panel.md`). The WCAG math, iso-contrast curve, fail-region polygon,
auto-correct and ancestor/background resolution are pure functions covered by unit tests; the e2e test
covers the real browser flow (toggle, ratio, overlay, reacting to a page background change). Parent-frame
resolution is unit-tested only (`getContrastBackgroundColor.spec.ts`).

## Right-click menu for several layers

When the right-clicked layer is part of the selection, the menu is built from the whole selection
(`useNodeMenuNodes` + `getNodeMenuFlags`): an item shows only if it fits every selected layer, and
Show/Hide, Lock/Unlock and Remove mask act on every selected layer in one undo step.

| #   | Scenario                                                                                                              | Unit |              E2E               |
| --- | --------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------------: |
| 624 | Right-clicking one layer of a section + rectangle selection hides the items a section lacks, and Show/Hide hides both |  ✅  | ✅ `node-context-menu.spec.ts` |
| 625 | Remove mask on two selected mask layers removes both masks, and one undo brings both back                             |  ✅  | ✅ `node-context-menu.spec.ts` |

## Line panel

A selected line gets its own panel: Position, Layout (height locked at 0), Appearance without corner
radius, Stroke with Position (fixed Center), Weight, Start point and End point, Effects and Export.
There is no Fill section.

| #   | Scenario                                                                                                                                                                                                                                           | Unit |               E2E               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------------: |
| 632 | A selected line shows the Line panel, and picking an end point draws it on the line                                                                                                                                                                |  ✅  |     ✅ `line-panel.spec.ts`     |
| 633 | A drop shadow on a line is drawn under it                                                                                                                                                                                                          |  ✅  |     ✅ `line-panel.spec.ts`     |
| 634 | Several lines with different weights show Mixed, and an end point picked applies to all                                                                                                                                                            |  ✅  |     ✅ `line-panel.spec.ts`     |
| 635 | Edit object in the Line panel "…" menu (Edit object, then a disabled Offset vector, no component items) turns the line into a vector and enters point editing                                                                                      |  ✅  |     ✅ `line-panel.spec.ts`     |
| 638 | A line selected with a rectangle shows the Mixed panel without Fill, and a typed stroke weight applies to both                                                                                                                                     |  ✅  |     ✅ `line-panel.spec.ts`     |
| 639 | A single arrow shows the Line panel titled Arrow, and turns back into Line once its arrowhead is removed                                                                                                                                           |  ✅  |     ✅ `line-panel.spec.ts`     |
| 640 | Several lines or arrows (any mix) keep the Line panel titled "N selected", with Mask, Boolean and the shared "…" menu (component items, Edit objects, Wrap in new section)                                                                         |  ✅  |     ✅ `line-panel.spec.ts`     |
| 641 | An Inside or Outside position moves a line stroke to one side of the line (left of its direction for Inside)                                                                                                                                       |  ✅  |     ✅ `line-panel.spec.ts`     |
| 642 | A line draws dashed (dash cap, arrowheads kept solid), width profile, dynamic and brush strokes                                                                                                                                                    |  ✅  |     ✅ `line-panel.spec.ts`     |
| 643 | The line stroke settings open without Join and Miter angle, and the Brush tab hides Start point and End point                                                                                                                                      |  ✅  |     ✅ `line-panel.spec.ts`     |
| 644 | Clicking where a line's inside/outside, dashed, dynamic or brush stroke is drawn selects the line, and its stroked bounds (marquee, snapping) follow the drawn stroke                                                                              |  ✅  |     ✅ `line-panel.spec.ts`     |
| 645 | A dashed line joined into a Union keeps the gaps between its dashes (was: the Union took the plain solid stroke)                                                                                                                                   |  ✅  | ✅ `boolean-operations.spec.ts` |
| 647 | A dynamic or brush stroke on a Union is drawn as that stroke around every loop of its shape (was: always a plain ring)                                                                                                                             |  ✅  | ✅ `boolean-operations.spec.ts` |
| 648 | Offset vector (line "…" menu) opens an Offset panel above the toolbar, previews the offset outline (sharp or round corners) around the line, and on ✓ / Enter turns the line into that vector in one undo step                                     |  ✅  |     ✅ `line-panel.spec.ts`     |
| 649 | Escape or Cancel leaves Offset vector without changing the line                                                                                                                                                                                    |  ✅  |     ✅ `line-panel.spec.ts`     |
| 650 | Offset vector keeps the line stroke mode (dynamic, brush, dashed, width profile) and its settings on the new vector, whose closed path is drawn in that mode                                                                                       |  ✅  |     ✅ `line-panel.spec.ts`     |
| 651 | A vector keeps its stroke mode once it is edited into open or branching paths (e.g. a line drawn onto an offset vector): every path between ends and junctions is drawn in the mode along its polyline                                             |  ✅  |     ✅ `line-panel.spec.ts`     |
| 652 | A selected ellipse shows the Ellipse panel; typed Arc Start, Sweep and Ratio values in Appearance turn, cut and hollow the ellipse on the canvas like its arc handles                                                                              |  ✅  |   ✅ `ellipse-panel.spec.ts`    |
| 653 | A corner radius typed in the Ellipse panel rounds the corners of a cut arc (pie or ring segment) on the canvas; a full ellipse has no corners to round                                                                                             |  ✅  |   ✅ `ellipse-panel.spec.ts`    |
| 654 | An ellipse has Fill and Effects in its panel like a rectangle: a second fill and a drop shadow added there are saved as paints and effects and drawn on the canvas                                                                                 |  ✅  |   ✅ `ellipse-panel.spec.ts`    |
| 655 | An ellipse stroke added in its panel follows the drawn shape (a cut arc keeps a solid band into its corners) and its Position moves the band inside or outside                                                                                     |  ✅  |   ✅ `ellipse-panel.spec.ts`    |
| 656 | The Ellipse panel Corner radius is disabled while no selected ellipse is cut (a full ellipse or an uncut ring has no corners) and enabled once the arc is cut                                                                                      |  ✅  |   ✅ `ellipse-panel.spec.ts`    |
| 657 | Flatten (or Edit object) of a rectangle or ellipse with a stroke keeps the stroke on the vector: color, weight, stroke mode settings and its Inside / Outside position, drawn along the closed path as before                                      |  ✅  |      ✅ `flatten.spec.ts`       |
| 658 | A polygon stores fills, strokes and effects like an ellipse: its stroke is drawn along the real outline, inside by default and outside when its Position says so                                                                                   |  ✅  |   ✅ `polygon-panel.spec.ts`    |
| 659 | Flatten keeps a polygon's stroke on the vector with its color, weight and Position                                                                                                                                                                 |  ✅  |      ✅ `flatten.spec.ts`       |
| 660 | A selected polygon shows the Polygon panel: Opacity and Corner radius, a Count field that sets the number of sides (3–60), Fill, Stroke, Effects and Export, and a "…" menu with Edit object and Offset vector                                     |  ✅  |   ✅ `polygon-panel.spec.ts`    |
| 661 | Offset vector (polygon "…" menu) previews the filled offset shape with a magenta outline, and on ✓ turns the polygon into that vector with its fill, in one undo step                                                                              |  ✅  |   ✅ `polygon-panel.spec.ts`    |
| 662 | A star stores fills, strokes and effects like a polygon: its stroke is drawn along the real outline, inside by default and outside when its Position says so                                                                                       |  ✅  |     ✅ `star-panel.spec.ts`     |
| 663 | Flatten keeps a star's stroke on the vector with its color, weight and Position                                                                                                                                                                    |  ✅  |      ✅ `flatten.spec.ts`       |
| 664 | A selected star shows the Star panel: Opacity and Corner radius, Count (3–60 points) and Ratio (0.1–100%) fields, Fill, Stroke, Effects and Export, and a "…" menu with Edit object and Offset vector                                              |  ✅  |     ✅ `star-panel.spec.ts`     |
| 665 | Offset vector (star "…" menu) previews the filled offset shape with a magenta outline, and on ✓ turns the star into that vector with its fill, in one undo step                                                                                    |  ✅  |     ✅ `star-panel.spec.ts`     |
| 666 | An inside or outside stroke wider than a star's points covers each thin point fully, with no fill showing through it and no stroke cutting into the middle (concave shapes offset cleanly)                                                         |  ✅  |     ✅ `star-panel.spec.ts`     |
| 667 | In Offset vector the layer shows only its outline (no selection box or handles); hovering the pink outline shows a resize cursor turned across it and the distance label, and dragging it out or in changes the distance; other presses do nothing |  ✅  |   ✅ `polygon-panel.spec.ts`    |
| 668 | Placing an image with the Media tool adds a rectangle named Image with one image fill; its panel is the rectangle panel with an Image header (Video for videos), and the layer shows an image icon                                                 |  ✅  |    ✅ `create-media.spec.ts`    |
| 669 | Selecting an image and a video together shows "N selected" in the rectangle panel header instead of Image or Video |  ✅  |   ✅ `create-media.spec.ts`    |
| 670 | Selecting several images shows a floating toolbar with only Remove background and Boost resolution (icon and text); a single image keeps its full toolbar, and a selection with a video shows none |  ✅  |   ✅ `create-media.spec.ts`    |
| 671 | A selected vector shows the Vector path panel; its X, W (with the aspect-ratio lock) and Rotation fields move, resize around the top-left and turn it |  ✅  |   ✅ `vector-panel.spec.ts`    |
| 672 | The vector Fill section: + on a vector without fills fills every closed area, − on the last fill empties them, and areas with different fills show "Click + to replace mixed content" where + gives them all one fill |  ✅  |   ✅ `vector-panel.spec.ts`    |
| 673 | The vector Appearance section: Opacity fades the vector's fill and stroke on the canvas (also inside a translucent parent), and a blend mode is stored on the vector |  ✅  |   ✅ `vector-panel.spec.ts`    |
| 674 | A vector stroke with a gradient paint is drawn with the gradient across the whole vector (red at one end of an edge, blue at the other); flattening a shape or Union keeps its gradient stroke |  ✅  |   ✅ `vector-panel.spec.ts`, `boolean-operations.spec.ts`    |
| 675 | The vector Stroke section sets the stroke weight and position (a vector without a position reads as Center, a first stroke on a vector without one gets weight 1), and Selection colors list every area fill and the strokes of a vector and write an edited color back into that area |  ✅  |   ✅ `vector-panel.spec.ts`    |
| 676 | The vector Effects section: a drop shadow follows the vector's filled areas and stroke on the canvas and moves with it while dragging (also resizing and rotating); inner shadow and noise use the same shape, background blur masks the filled areas, and SVG/PDF export falls back to raster for a vector with effects |  ✅  |   ✅ `vector-panel.spec.ts`    |
| 677 | The vector Corner radius rounds every corner where two straight segments meet (the arc stops at half of the shorter segment), keeps the fill on the rounded area, and shows Mixed for vectors with different radii |  ✅  |   ✅ `vector-panel.spec.ts`    |
| 683 | The vector header shows Edit object for one vector and, with several vectors selected, a more actions menu whose Edit objects (above Wrap in section) opens all of them in vector edit mode |  ✅  |   ✅ `vector-panel.spec.ts`    |
| 687 | A single vector in vector edit mode shows the Vector edit panel: a Vector section (Alignment, Position, Mirroring, Corner radius — alignment, position and mirroring disabled while no points are selected), then Fill and Stroke only; leaving edit mode brings back the Vector path panel |  ✅  |   ✅ `vector-panel.spec.ts`    |
| 688 | In vector edit mode the selected points drive the Vector edit panel: X/Y show and move the top left corner of the selected points, Mirroring shows and sets their handle mirroring, Corner radius (one-corner icon) shows and sets their own radius; with no point selected Corner radius sets the whole vector, drops the point radii and shows Mixed when the points differ (also in the Vector path panel) |  ✅  |   ✅ `vector-panel.spec.ts`    |
| 689 | In vector edit mode Alignment, Tidy up and Distribute work on groups of selected points (the selected points of one connected piece move together, the rest of that piece stays) and only with at least two groups (three for Distribute) |  ✅  |   ✅ `vector-panel.spec.ts`    |
