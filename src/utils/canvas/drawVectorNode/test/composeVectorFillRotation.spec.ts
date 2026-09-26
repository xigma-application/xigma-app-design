// utils
import { composeVectorFillRotation } from '../composeVectorFillRotation';

const base = { center: { x: 50, y: 50 }, degrees: 30, localBounds: { height: 100, width: 100, x: 0, y: 0 } };

describe('composeVectorFillRotation', () => {
  it('should add a turn around the vector centre to the fill rotation it already has', () => {
    // result
    expect(composeVectorFillRotation(base, { x: 50, y: 50 }, 60)).toEqual({ ...base, degrees: 90 });
  });

  it('should carry the fill along a turn around another pivot', () => {
    // before
    const rotation = composeVectorFillRotation({ ...base, degrees: 0 }, { x: 150, y: 50 }, 180);

    // result
    expect(rotation.degrees).toBe(180);
    expect(rotation.center.x).toBeCloseTo(250);
    expect(rotation.center.y).toBeCloseTo(50);
    expect(rotation.localBounds.x).toBeCloseTo(200);
  });
});
