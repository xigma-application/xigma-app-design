// utils
import { buildStrokeRing } from '../buildStrokeRing';
import { getStrokeRingDistances } from '../getStrokeRingDistances';
import { sampleStrokeRing } from '../sampleStrokeRing';

const outer = [
  { x: -5, y: -5 },
  { x: 105, y: -5 },
  { x: 105, y: 105 },
  { x: -5, y: 105 },
];
const inner = [
  { x: 5, y: 5 },
  { x: 95, y: 5 },
  { x: 95, y: 95 },
  { x: 5, y: 95 },
];

describe('stroke ring helpers', () => {
  it('should build the centre line with its perimeter and cumulative distances', () => {
    // action
    const ring = buildStrokeRing(outer, inner);

    // result
    expect(ring.perimeter).toBeCloseTo(400);
    expect(ring.cumulative).toEqual([0, 100, 200, 300]);
  });

  it('should sample the centre point, tangent and outward vector at a distance and wrap around', () => {
    // before
    const ring = buildStrokeRing(outer, inner);

    // action
    const onTop = sampleStrokeRing(ring, 50);
    const wrapped = sampleStrokeRing(ring, 450);

    // result
    expect(onTop.mid).toEqual({ x: 50, y: 0 });
    expect(onTop.tangent).toEqual({ x: 1, y: 0 });
    expect(onTop.vec).toEqual({ x: 0, y: -5 });
    expect(wrapped.mid).toEqual({ x: 50, y: 0 });
  });

  it('should list every ring vertex plus a regular grid without duplicates', () => {
    // before
    const ring = buildStrokeRing(outer, inner);

    // action
    const distances = getStrokeRingDistances(ring, 50);

    // result
    expect(distances).toEqual([0, 50, 100, 150, 200, 250, 300, 350]);
  });
});
