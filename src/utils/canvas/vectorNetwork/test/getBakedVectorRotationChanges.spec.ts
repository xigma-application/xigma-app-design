// utils
import { getBakedVectorRotationChanges } from '../getBakedVectorRotationChanges';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getBakedVectorRotationChanges', () => {
  it('should turn the points, reset the rotation and keep the turn for the fill', () => {
    // before
    const changes = getBakedVectorRotationChanges(makeSquareVector({ fillRotation: 10, rotation: 90 }));

    // result
    expect(changes.rotation).toBe(0);
    expect(changes.fillRotation).toBe(100);
    expect(Object.values(changes.vertices).map(({ x, y }) => [Math.round(x) + 0, Math.round(y) + 0])).toContainEqual([100, 0]);
  });

  it('should start the fill turn from the rotation of a vector without one', () => {
    // result
    expect(getBakedVectorRotationChanges(makeSquareVector({ rotation: 30 })).fillRotation).toBe(30);
  });
});
