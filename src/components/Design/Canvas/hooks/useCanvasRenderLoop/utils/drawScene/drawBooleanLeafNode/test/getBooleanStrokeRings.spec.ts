// utils
import { booleanShape } from './fixtures';
import { getBooleanStrokeRings } from '../getBooleanStrokeRings';

describe('getBooleanStrokeRings', () => {
  it('should wrap every loop of the shape in a centered ring as wide as the stroke', () => {
    // before
    const [ring] = getBooleanStrokeRings(booleanShape, 4);

    // result
    const spans = ring.map((loop) => [Math.min(...loop.map((point) => point.x)), Math.max(...loop.map((point) => point.x))]);

    expect(spans.sort(([a], [b]) => a - b)).toEqual([
      [8, 162],
      [12, 158],
    ]);
  });

  it('should reuse the rings for the same shape and stroke width', () => {
    // result
    expect(getBooleanStrokeRings(booleanShape, 2)).toBe(getBooleanStrokeRings(booleanShape, 2));
    expect(getBooleanStrokeRings(booleanShape, 3)).not.toBe(getBooleanStrokeRings(booleanShape, 2));
  });
});
