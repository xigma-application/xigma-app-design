// utils
import { hasVectorCornerRadius } from '../hasVectorCornerRadius';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('hasVectorCornerRadius', () => {
  it('should be true for a vector radius or a point radius above 0', () => {
    // result
    expect(hasVectorCornerRadius(makeSquareVector({ cornerRadius: 4 }))).toBe(true);
    expect(hasVectorCornerRadius(makeSquareVector({ cornerRadiusByVertexId: { a: 0, b: 3 } }))).toBe(true);
  });

  it('should be false without any radius above 0', () => {
    // result
    expect(hasVectorCornerRadius(makeSquareVector())).toBe(false);
    expect(hasVectorCornerRadius(makeSquareVector({ cornerRadius: 0, cornerRadiusByVertexId: { a: 0 } }))).toBe(false);
  });
});
