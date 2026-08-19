// utils
import { getRotatedNodeChanges } from '../getRotatedNodeChanges';

describe('getRotatedNodeChanges', () => {
  it('should rotate a line origin by its endpoints', () => {
    // mock
    const origin = { x1: 100, x2: 100, y1: 0, y2: 100 };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 100, y: 50 }, 90);

    // result
    expect(changes).toMatchObject({ x1: 150, x2: 50, y1: 50, y2: 50 });
  });

  it('should rotate a vector origin by its vertices and tangents', () => {
    // mock
    const origin = { segments: {}, vertices: { v1: { id: 'v1', x: 100, y: 50 } } };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 50, y: 50 }, 90);

    // result
    expect(changes).toMatchObject({ vertices: { v1: { id: 'v1', x: 50, y: 100 } } });
  });

  it('should rotate a shape origin by its center, falling back to the default case', () => {
    // mock
    const origin = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    const changes = getRotatedNodeChanges(origin, { x: 50, y: 50 }, 90);

    // result
    expect(changes).toEqual({ rotation: 90, x: 0, y: 0 });
  });
});
