// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutPadding } from '../../getAutoLayoutContentBox';

// utils
import { getAutoLayoutDropTarget } from '../getAutoLayoutDropTarget';

const NO_PADDING: TAutoLayoutPadding = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

describe('getAutoLayoutDropTarget', () => {
  it('should land a 30-wide item at the start of an empty vertical frame, indicator spanning its width', () => {
    // action
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      10,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [],
      [],
      null,
      { height: 20, width: 30 },
      { x: 50, y: 50 },
    );

    // result — a lone item is placed at the frame's origin; the indicator is a thin horizontal
    // bar (height = thickness) spanning the dragged item's width, held off the edge by the
    // minimum gap (there's no real padding yet, so this stands in for it)
    expect(dropTarget.index).toBe(0);
    expect(dropTarget.indicator).toEqual({ height: 3, width: 30, x: 2, y: 2 });
  });

  it('should insert before the first child when the cursor is above it, on a vertical frame', () => {
    // action — one 20-tall child already at y=0; cursor above its midpoint
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      10,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [{ height: 20, id: 'a', width: 20 }],
      [{ id: 'a', x: 0, y: 0 }],
      null,
      { height: 20, width: 30 },
      { x: 0, y: 5 },
    );

    // result
    expect(dropTarget.index).toBe(0);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 2 });
  });

  it('should insert after the last child when the cursor is past it, on a vertical frame', () => {
    // action — one 20-tall child at y=0; cursor well past its midpoint
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      10,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [{ height: 20, id: 'a', width: 20 }],
      [{ id: 'a', x: 0, y: 0 }],
      null,
      { height: 20, width: 30 },
      { x: 0, y: 100 },
    );

    // result — lands halfway through the 10px gap after the existing child (y=20 + 10/2), not
    // flush against a phantom next sibling
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 25 });
  });

  it('should centre the indicator in the gap between two existing children, not flush against the next one, on a vertical frame', () => {
    // action — two 20-tall siblings with a 10px gap between them (a: y0-20, b: y30-50); cursor
    // lands the dragged item between them
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      10,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [
        { height: 20, id: 'a', width: 20 },
        { height: 20, id: 'b', width: 20 },
      ],
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 0, y: 30 },
      ],
      null,
      { height: 20, width: 30 },
      { x: 0, y: 25 },
    );

    // result — a's own trailing edge is y=20; the indicator sits at the gap's own midpoint
    // (20 + 10/2 = 25), equidistant from both real neighbours regardless of the dragged item's size
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 25 });
  });

  it('should sit exactly at the touching boundary between two zero-gap siblings, not offset toward either one', () => {
    // action — two 20-tall siblings stacked with no gap at all (a: y0-20, b: y20-40)
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      0,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [
        { height: 20, id: 'a', width: 20 },
        { height: 20, id: 'b', width: 20 },
      ],
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 0, y: 20 },
      ],
      null,
      { height: 20, width: 30 },
      { x: 0, y: 20 },
    );

    // result — with a zero gap, half the gap is still zero: the indicator sits right at the
    // shared boundary
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 20 });
  });

  it('should land halfway through the gap before the only child, not flush against the frame’s top edge, on a centre-aligned vertical frame', () => {
    // action — a 200-tall frame, one 20-tall child real-positioned by centre alignment (y=90);
    // cursor above it
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      10,
      AlignmentLayout.center,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [{ height: 20, id: 'a', width: 20 }],
      [{ id: 'a', x: 0, y: 90 }],
      null,
      { height: 20, width: 30 },
      { x: 0, y: 50 },
    );

    // result — centred in the gap before 'a' (90 - 10/2 = 85); a centre-aligned frame has no near
    // edge for the first position to hug (x is centre-aligned too, on the counter axis: (200-30)/2)
    expect(dropTarget.index).toBe(0);
    expect(dropTarget.indicator).toMatchObject({ x: 85, y: 85 });
  });

  it('should land halfway through the gap after the only child, not flush against the frame’s bottom edge, on a centre-aligned vertical frame', () => {
    // action — same frame; cursor below the child
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      10,
      AlignmentLayout.center,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [{ height: 20, id: 'a', width: 20 }],
      [{ id: 'a', x: 0, y: 90 }],
      null,
      { height: 20, width: 30 },
      { x: 0, y: 150 },
    );

    // result — centred in the gap after 'a' (90 + 20 + 10/2 = 115); no far edge to hug either
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 85, y: 115 });
  });

  it('should land halfway through the gap before the only child on a bottom-aligned vertical frame — only the last position hugs an edge', () => {
    // action — a 200-tall frame, bottom-left alignment, one 20-tall child real-positioned flush
    // with the frame's bottom edge (y=180); cursor above it
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      10,
      AlignmentLayout.bottomLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [{ height: 20, id: 'a', width: 20 }],
      [{ id: 'a', x: 0, y: 180 }],
      null,
      { height: 20, width: 30 },
      { x: 0, y: 100 },
    );

    // result — centred in the gap before 'a' (180 - 10/2 = 175), not stuck to the frame's top edge
    expect(dropTarget.index).toBe(0);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 175 });
  });

  it('should hug the frame’s own bottom edge when appending after the last child on a bottom-aligned vertical frame', () => {
    // action — same frame; cursor below the child, past its own near-edge threshold
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      10,
      AlignmentLayout.bottomLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [{ height: 20, id: 'a', width: 20 }],
      [{ id: 'a', x: 0, y: 180 }],
      null,
      { height: 20, width: 30 },
      { x: 0, y: 195 },
    );

    // result — the packed item's own top edge sits at y=180 (180 + its own 20 = the frame's
    // bottom, 200), but the indicator is a thin 3px bar, not the item's own full height — it's
    // anchored to that same far edge (200), offset inward by only its own thickness, landing at
    // y=197, not flush with the item's own top (180)
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 197 });
  });

  it('should build a vertical indicator bar (thickness on the horizontal axis) for a horizontal frame', () => {
    // action
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.horizontal,
      0,
      AlignmentLayout.topLeft,
      { height: 100, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [],
      [],
      null,
      { height: 40, width: 20 },
      { x: 10, y: 10 },
    );

    // result
    expect(dropTarget.index).toBe(0);
    expect(dropTarget.indicator).toEqual({ height: 40, width: 3, x: 2, y: 2 });
  });

  it('should centre the indicator in the gap after the last child on a horizontal frame too', () => {
    // action — one 20-wide child at x=0 with a 10px gap; cursor well past its midpoint
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.horizontal,
      10,
      AlignmentLayout.topLeft,
      { height: 100, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [{ height: 20, id: 'a', width: 20 }],
      [{ id: 'a', x: 0, y: 0 }],
      null,
      { height: 40, width: 20 },
      { x: 100, y: 10 },
    );

    // result — a's own trailing edge is x=20; the indicator sits halfway through the 10px gap
    // (x=25), not flush against a phantom next sibling
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 25, y: 2 });
  });

  it('should clamp the indicator to a minimum gap relative to the frame’s own edge, not the canvas origin', () => {
    // action — a frame that itself sits away from the canvas origin
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      0,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 100, y: 300 },
      NO_PADDING,
      [],
      [],
      null,
      { height: 20, width: 30 },
      { x: 150, y: 350 },
    );

    // result
    expect(dropTarget.indicator).toMatchObject({ x: 102, y: 302 });
  });

  it('should place the indicator at the real padding inset once padding reaches the minimum gap or more', () => {
    // action — 5px padding on every side, well past the 2px minimum
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      0,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      { paddingBottom: 5, paddingLeft: 5, paddingRight: 5, paddingTop: 5 },
      [],
      [],
      null,
      { height: 20, width: 30 },
      { x: 50, y: 50 },
    );

    // result — sits at the real padding inset, the minimum-gap clamp has nothing left to do
    expect(dropTarget.indicator).toMatchObject({ x: 5, y: 5 });
  });

  it('should still enforce the minimum gap when padding falls short of it', () => {
    // action — 1px padding, less than the 2px minimum
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      0,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      { paddingBottom: 1, paddingLeft: 1, paddingRight: 1, paddingTop: 1 },
      [],
      [],
      null,
      { height: 20, width: 30 },
      { x: 50, y: 50 },
    );

    // result — the minimum-gap floor still wins over the smaller real padding
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 2 });
  });

  it('should report every real sibling’s own position, with a gap opened up for the dragged item', () => {
    // action — two 20-tall siblings stacked with no gap; cursor lands the dragged item between them
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      0,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [
        { height: 20, id: 'a', width: 20 },
        { height: 20, id: 'b', width: 20 },
      ],
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 0, y: 20 },
      ],
      null,
      { height: 20, width: 20 },
      { x: 0, y: 25 },
    );

    // result — a is untouched at the top; b is pushed down by the dragged item's own 20px height
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.siblingPositions).toEqual({ a: { x: 0, y: 0 }, b: { x: 0, y: 40 } });
  });

  it('should never include the dragged placeholder itself in siblingPositions', () => {
    // action
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      10,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [],
      [],
      null,
      { height: 20, width: 30 },
      { x: 50, y: 50 },
    );

    // result — no siblings at all, so the map is empty; specifically not `{ __dragged__: ... }`
    expect(dropTarget.siblingPositions).toEqual({});
  });

  it('should keep a same-parent reorder at the dragged item’s old slot until the cursor touches the next sibling’s own near edge', () => {
    // action — dragging item 'b' (originally at index 1) out of a stack of three 20-tall items
    // with no gap; remaining siblings 'a' and 'c' keep their real, undisturbed on-screen
    // positions (b's old slot between them is still visually open, not yet compacted away)
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      0,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [
        { height: 20, id: 'a', width: 20 },
        { height: 20, id: 'c', width: 20 },
      ],
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'c', x: 0, y: 40 },
      ],
      1,
      { height: 20, width: 20 },
      { x: 0, y: 35 },
    );

    // result — c's own near edge is y=40; a cursor at y=35 hasn't touched it yet, so the drop
    // stays right after a (index 1), not after c
    expect(dropTarget.index).toBe(1);
  });

  it('should advance a same-parent reorder past the next sibling the instant the cursor touches its near edge, not its midpoint', () => {
    // action — same setup as above, cursor now touching c's own near edge (y=40)
    const dropTarget = getAutoLayoutDropTarget(
      LayoutMode.vertical,
      0,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      NO_PADDING,
      [
        { height: 20, id: 'a', width: 20 },
        { height: 20, id: 'c', width: 20 },
      ],
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'c', x: 0, y: 40 },
      ],
      1,
      { height: 20, width: 20 },
      { x: 0, y: 40 },
    );

    // result
    expect(dropTarget.index).toBe(2);
  });
});
