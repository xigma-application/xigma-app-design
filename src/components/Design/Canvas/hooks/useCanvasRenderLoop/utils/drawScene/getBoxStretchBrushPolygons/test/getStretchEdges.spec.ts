// utils
import { buildStrokeRing } from '../../buildStrokeRing';
import { getStretchEdges } from '../getStretchEdges';

const ring = buildStrokeRing(
  [
    { x: -5, y: -5 },
    { x: 105, y: -5 },
    { x: 105, y: 105 },
    { x: -5, y: 105 },
  ],
  [
    { x: 5, y: 5 },
    { x: 95, y: 5 },
    { x: 95, y: 95 },
    { x: 5, y: 95 },
  ],
);
const flat = [{ amplitude: 1, smoothen: 0, stepped: false, values: [0, 0], wavelength: 100 }];

describe('getStretchEdges', () => {
  it('should put the edges on the ring without roughness at full width', () => {
    // action
    const { inner, outer } = getStretchEdges(ring, flat, flat, 0, 50, () => 1);

    // result
    expect(outer).toHaveLength(inner.length);
    expect(outer[0]).toEqual({ x: -5, y: -5 });
    expect(inner[0]).toEqual({ x: 5, y: 5 });
  });

  it('should pull the edges towards the centre line with a smaller multiplier', () => {
    // action
    const { inner, outer } = getStretchEdges(ring, flat, flat, 0, 50, () => 0.5);

    // result
    expect(outer[0]).toEqual({ x: -2.5, y: -2.5 });
    expect(inner[0]).toEqual({ x: 2.5, y: 2.5 });
  });
});
