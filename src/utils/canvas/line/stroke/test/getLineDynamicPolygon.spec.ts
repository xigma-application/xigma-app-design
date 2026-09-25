// utils
import { getLineDynamicPolygon } from '../getLineDynamicPolygon';
import { getLineFrame } from '../getLineFrame';
import { makeLine } from './fixtures';

const frame = getLineFrame(makeLine());

describe('getLineDynamicPolygon', () => {
  it('should wiggle the band sideways while keeping its width', () => {
    // before
    const polygon = getLineDynamicPolygon(frame, { frequency: 50, smoothen: 50, wiggle: 100 }, 'seed') ?? [];
    const half = polygon.length / 2;
    const widths = polygon.slice(0, half).map((point, index) => polygon[polygon.length - 1 - index].y - point.y);

    // result
    expect(polygon.slice(0, half).some((point) => Math.abs(point.y + 2) > 0.01)).toBe(true);
    widths.forEach((width) => expect(width).toBeCloseTo(4, 5));
  });

  it('should keep the same shape for the same seed and sample without smoothing', () => {
    // result
    expect(getLineDynamicPolygon(frame, { frequency: 50, smoothen: 0, wiggle: 50 }, 'a')).toEqual(
      getLineDynamicPolygon(frame, { frequency: 50, smoothen: 0, wiggle: 50 }, 'a'),
    );
  });

  it('should draw nothing for a zero frequency', () => {
    // result
    expect(getLineDynamicPolygon(frame, { frequency: 0, smoothen: 50, wiggle: 50 }, 'seed')).toBeNull();
  });
});
