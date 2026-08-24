// utils
import { getGeometryDeltaChanges } from '../getGeometryDeltaChanges';

describe('getGeometryDeltaChanges', () => {
  it('should shift x1/x2/y1/y2 for a line-shaped origin', () => {
    // mock
    const origin = { x1: 0, x2: 10, y1: 0, y2: 5 };

    // before
    const changes = getGeometryDeltaChanges(origin, 2.6, -3.4);

    // result
    expect(changes).toEqual({ x1: 3, x2: 13, y1: -3, y2: 2 });
  });

  it('should translate every vertex for a vector-shaped origin', () => {
    // mock
    const origin = { segments: {}, vertices: { v1: { x: 0, y: 0 } } };

    // before
    const changes = getGeometryDeltaChanges(origin, 5, 5);

    // result
    expect(changes).toEqual({ vertices: { v1: { id: 'v1', x: 5, y: 5 } } });
  });

  it('should shift x/y for a box-shaped origin', () => {
    // mock
    const origin = { x: 10, y: 20 };

    // before
    const changes = getGeometryDeltaChanges(origin, 1.6, 2.4);

    // result
    expect(changes).toEqual({ x: 12, y: 22 });
  });
});
