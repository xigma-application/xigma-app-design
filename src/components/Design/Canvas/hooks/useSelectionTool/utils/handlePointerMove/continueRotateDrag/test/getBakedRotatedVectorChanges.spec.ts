// utils
import { getBakedRotatedVectorChanges } from '../getBakedRotatedVectorChanges';

describe('getBakedRotatedVectorChanges', () => {
  it('should turn the points around the pivot and add the turn to the fill', () => {
    // before
    const changes = getBakedRotatedVectorChanges(
      { fillRotation: 0, rotation: 0, segments: {}, vertices: { v1: { x: 100, y: 50 } } },
      { x: 50, y: 50 },
      90,
    );

    // result
    expect(changes.rotation).toBe(0);
    expect(changes.fillRotation).toBe(90);
    expect(changes.vertices.v1.x).toBeCloseTo(50);
  });

  it('should drop the fill turn when it adds up to a full turn back to 0', () => {
    // before
    const changes = getBakedRotatedVectorChanges({ fillRotation: 30, rotation: 0, segments: {}, vertices: {} }, { x: 0, y: 0 }, -30);

    // result
    expect(changes.fillRotation).toBeUndefined();
  });
});
