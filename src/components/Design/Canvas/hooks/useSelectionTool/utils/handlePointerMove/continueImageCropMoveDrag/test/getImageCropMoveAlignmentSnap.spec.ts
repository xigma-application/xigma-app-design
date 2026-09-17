// utils
import { getImageCropMoveAlignmentSnap } from '../getImageCropMoveAlignmentSnap';

const frameBounds = { height: 100, width: 100, x: 0, y: 0 };

describe('getImageCropMoveAlignmentSnap', () => {
  it('should leave the delta untouched and return no guide when nothing is within tolerance', () => {
    // before
    const result = getImageCropMoveAlignmentSnap({ height: 10, width: 10, x: 65, y: 68 }, frameBounds, { x: 5, y: 8 }, 4);

    // result
    expect(result).toEqual({ delta: { x: 5, y: 8 }, guide: null });
  });

  it('should correct the delta and build a guide spanning the full frame when the crop center is within tolerance of the frame center', () => {
    // before — crop bounds already centered at (49,49), 1 unit off the frame's own (50,50) center
    const result = getImageCropMoveAlignmentSnap({ height: 40, width: 40, x: 29, y: 29 }, frameBounds, { x: 21, y: 21 }, 4);

    // result — corrected so the crop's own center lands exactly on the frame's center
    expect(result).toEqual({
      delta: { x: 22, y: 22 },
      guide: {
        horizontal: { anchor: { x: 0, y: 50 }, match: { x: 100, y: 50 } },
        vertical: { anchor: { x: 50, y: 0 }, match: { x: 50, y: 100 } },
      },
    });
  });

  it('should snap only the axis that falls within tolerance, leaving the other axis’s delta untouched', () => {
    // before — crop's left edge (x=1) is 1 unit off the frame's own left edge (x=0); y is far from any frame coordinate
    const result = getImageCropMoveAlignmentSnap({ height: 40, width: 40, x: 1, y: 55 }, frameBounds, { x: -4, y: 0 }, 4);

    // result
    expect(result).toEqual({
      delta: { x: -5, y: 0 },
      guide: { horizontal: null, vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 100 } } },
    });
  });

  it('should not snap when the distance exceeds the given tolerance', () => {
    // before — crop center 5 units off the frame center, tolerance is 4
    const result = getImageCropMoveAlignmentSnap({ height: 40, width: 40, x: 25, y: 25 }, frameBounds, { x: 17, y: 17 }, 4);

    // result
    expect(result).toEqual({ delta: { x: 17, y: 17 }, guide: null });
  });
});
