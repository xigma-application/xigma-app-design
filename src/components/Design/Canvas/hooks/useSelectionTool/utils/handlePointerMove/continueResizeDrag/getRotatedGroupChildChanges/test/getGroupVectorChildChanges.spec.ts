// utils
import { getGroupVectorChildChanges } from '../getGroupVectorChildChanges';
import { getNextGroupChildPoint } from '../getNextGroupChildPoint';

describe('getGroupVectorChildChanges', () => {
  it('should map every vertex through nextPoint, keeping vertex ids', () => {
    const nextPoint = getNextGroupChildPoint(
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 200, x: 0, y: 0 },
      { x: 1, y: 1 },
    );

    const changes = getGroupVectorChildChanges({ segments: {}, vertices: { v1: { x: 0, y: 50 }, v2: { x: 100, y: 50 } } }, nextPoint);

    expect(changes).toEqual({ vertices: { v1: { id: 'v1', x: 0, y: 50 }, v2: { id: 'v2', x: 200, y: 50 } } });
  });
});
