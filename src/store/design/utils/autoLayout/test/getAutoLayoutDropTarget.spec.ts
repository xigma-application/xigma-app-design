// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';

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
      { height: 20, width: 30 },
      { x: 0, y: 100 },
    );

    // result — lands right after the existing child, past its 20-tall box plus the 10 gap;
    // far enough from the top edge that the minimum-gap clamp has no effect
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 30 });
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
      { height: 40, width: 20 },
      { x: 10, y: 10 },
    );

    // result
    expect(dropTarget.index).toBe(0);
    expect(dropTarget.indicator).toEqual({ height: 40, width: 3, x: 2, y: 2 });
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
      { height: 20, width: 30 },
      { x: 50, y: 50 },
    );

    // result — the minimum-gap floor still wins over the smaller real padding
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 2 });
  });
});
