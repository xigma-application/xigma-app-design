// constant
import { PATTERN_PLACEHOLDER_DOT_SEGMENTS } from 'constant/canvas';

// utils
import { getPatternPlaceholderDotVertices } from '../getPatternPlaceholderDotVertices';

describe('getPatternPlaceholderDotVertices', () => {
  it('should return an empty triangle-list for a zero-size rect other than the guaranteed single dot', () => {
    // before
    const vertices = getPatternPlaceholderDotVertices({ height: 0, width: 0, x: 0, y: 0 });

    // result — width/height 0 still resolves to at least a single 1x1 grid cell, one dot
    expect(vertices.length).toBe(PATTERN_PLACEHOLDER_DOT_SEGMENTS * 6);
  });

  it('should return 6 flattened numbers (3 vertices) per triangle, per dot segment', () => {
    // before
    const vertices = getPatternPlaceholderDotVertices({ height: 40, width: 40, x: 0, y: 0 });

    // result
    expect(vertices.length % 6).toBe(0);
    expect(vertices.every((value) => typeof value === 'number' && Number.isFinite(value))).toBe(true);
  });

  it('should place more dots across a larger rect than a smaller one', () => {
    // before
    const smallVertices = getPatternPlaceholderDotVertices({ height: 20, width: 20, x: 0, y: 0 });
    const largeVertices = getPatternPlaceholderDotVertices({ height: 200, width: 200, x: 0, y: 0 });

    // result
    expect(largeVertices.length).toBeGreaterThan(smallVertices.length);
  });

  it('should offset every dot vertex by the rect origin', () => {
    // before
    const atOrigin = getPatternPlaceholderDotVertices({ height: 20, width: 20, x: 0, y: 0 });
    const shifted = getPatternPlaceholderDotVertices({ height: 20, width: 20, x: 100, y: 50 });

    // result — every x coordinate (even indices) shifts by 100, every y coordinate (odd indices) by 50
    for (let index = 0; index < atOrigin.length; index += 2) {
      expect(shifted[index]).toBeCloseTo(atOrigin[index] + 100);
      expect(shifted[index + 1]).toBeCloseTo(atOrigin[index + 1] + 50);
    }
  });
});
