// utils
import { getResizeOrScaleFactors } from '../getResizeOrScaleFactors';

describe('getResizeOrScaleFactors', () => {
  it('should use the plain resize factors when the scale tool is not active', () => {
    // mock — "n" is an edge handle, so the plain resize leaves the x axis untouched (null anchor)
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // result
    expect(getResizeOrScaleFactors(false, 'n', bounds, { x: 50, y: -50 }, 2, false)).toEqual({
      anchors: { x: null, y: 50 },
      scaleX: 1,
      scaleY: 2,
    });
  });

  it('should use the scale factors when the scale tool is active, forcing proportional scaling even without Shift', () => {
    // mock — same drag as above, but the scale tool now grows width proportionally too
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // result
    expect(getResizeOrScaleFactors(true, 'n', bounds, { x: 50, y: -50 }, 2, false)).toEqual({
      anchors: { x: 50, y: 50 },
      scaleX: 2,
      scaleY: 2,
    });
  });

  it('should also use the scale factors when aspect lock is requested (Shift/lockedAspectRatio) without the scale tool, so an edge handle stays proportional', () => {
    // mock — same drag/result as the scale-tool case above, but via the aspect-lock flag instead
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // result
    expect(getResizeOrScaleFactors(false, 'n', bounds, { x: 50, y: -50 }, 2, true)).toEqual({
      anchors: { x: 50, y: 50 },
      scaleX: 2,
      scaleY: 2,
    });
  });
});
