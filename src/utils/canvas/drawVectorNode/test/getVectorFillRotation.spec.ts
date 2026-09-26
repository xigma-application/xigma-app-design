// utils
import { getVectorFillRotation } from '../getVectorFillRotation';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getVectorFillRotation', () => {
  it('should turn the fill of a rotated vector with it around the middle of its unrotated bounds', () => {
    // result
    expect(getVectorFillRotation(makeSquareVector({ rotation: 30 }))).toEqual({
      center: { x: 50, y: 50 },
      degrees: 30,
      localBounds: { height: 100, width: 100, x: 0, y: 0 },
    });
  });

  it('should leave the fill of a vector without rotation alone', () => {
    // result
    expect(getVectorFillRotation(makeSquareVector())).toBeUndefined();
  });
});
