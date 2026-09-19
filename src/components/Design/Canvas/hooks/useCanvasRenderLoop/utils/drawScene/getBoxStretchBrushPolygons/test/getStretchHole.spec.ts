// utils
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { getStretchHole } from '../getStretchHole';

const sample = { mid: { x: 50, y: 0 }, tangent: { x: 1, y: 0 }, vec: { x: 0, y: -8 } };

describe('getStretchHole', () => {
  it('should return a closed ellipse polygon inside the band, longer along the path than across', () => {
    // action
    const hole = getStretchHole(sample, 1, 16, createSeededRandom('hole'));
    const width = Math.max(...hole.map((point) => point.x)) - Math.min(...hole.map((point) => point.x));
    const height = Math.max(...hole.map((point) => point.y)) - Math.min(...hole.map((point) => point.y));

    // result
    expect(hole).toHaveLength(8);
    expect(width).toBeGreaterThan(height);
    expect(hole.every((point) => Math.abs(point.y) < 8)).toBe(true);
  });

  it('should shrink with the multiplier', () => {
    // action
    const big = getStretchHole(sample, 1, 16, createSeededRandom('hole'));
    const small = getStretchHole(sample, 0.5, 16, createSeededRandom('hole'));
    const spread = (points: { x: number }[]): number =>
      Math.max(...points.map((point) => point.x)) - Math.min(...points.map((point) => point.x));

    // result
    expect(spread(small)).toBeLessThan(spread(big));
  });
});
