// utils
import { getScaleBounds } from '../getScaleBounds';

describe('getScaleBounds', () => {
  it('should grow both axes proportionally from an edge handle, centered on the untouched axis', () => {
    // mock — "n" (top edge) anchors at the bottom-center point (50, 50) of a 100x50 box
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // result — dragging straight up by 100 doubles both dimensions, staying centered on x=50
    expect(getScaleBounds('n', bounds, { x: 50, y: -50 }, 2)).toEqual({ height: 100, width: 200, x: -50, y: -50 });
  });

  it('should grow both axes proportionally from the opposite edge handle, centered on the untouched axis', () => {
    // mock — "e" (right edge) anchors at the left-center point (0, 25) of a 100x50 box
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // result — dragging straight right by 150 sets width=150, height follows the 2:1 ratio,
    expect(getScaleBounds('e', bounds, { x: 150, y: 25 }, 2)).toEqual({ height: 75, width: 150, x: 0, y: -12.5 });
  });

  it('should match the plain corner-anchored aspect lock for a corner handle', () => {
    // mock
    const bounds = { height: 100, width: 100, x: 0, y: 0 };

    // result — same shape as getAspectRatioLockedRect's own "drive from width" case
    expect(getScaleBounds('se', bounds, { x: 100, y: 20 }, 2)).toEqual({ height: 50, width: 100, x: 0, y: 0 });
  });

  it('should mirror an edge handle past its anchor, same crossing behavior as a plain resize', () => {
    // mock — "e" dragged left past the anchor (x=0) grows the box westward instead
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    expect(getScaleBounds('e', bounds, { x: -50, y: 25 }, 2)).toEqual({ height: 25, width: 50, x: -50, y: 12.5 });
  });
});
