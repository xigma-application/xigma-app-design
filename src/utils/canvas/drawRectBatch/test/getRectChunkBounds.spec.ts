// types
import { TRectangleNode } from 'types/design/types';

// utils
import { getRectChunkBounds } from '../getRectChunkBounds';

const createNode = (x: number, y: number, rotation: number): TRectangleNode =>
  ({ fills: [], height: 6, id: 'r', name: 'r', parentId: null, rotation, type: 'rectangle', width: 8, x, y }) as unknown as TRectangleNode;

describe('getRectChunkBounds', () => {
  it('should union the exact bounds of unrotated rectangles', () => {
    // before
    const bounds = getRectChunkBounds([createNode(0, 0, 0), createNode(20, 30, 0)]);

    // result
    expect(bounds).toEqual({ maxX: 28, maxY: 36, minX: 0, minY: 0 });
  });

  it('should use the circumscribed circle for a rotated rectangle', () => {
    // before
    const bounds = getRectChunkBounds([createNode(0, 0, 45)]);

    // result
    expect(bounds).toEqual({ maxX: 4 + 5, maxY: 3 + 5, minX: 4 - 5, minY: 3 - 5 });
  });

  it('should grow the bounds by the stroke width of a stroked rectangle', () => {
    // mock
    const node = {
      ...createNode(0, 0, 0),
      strokeWidth: 4,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
    } as unknown as TRectangleNode;

    // before
    const bounds = getRectChunkBounds([node]);

    // result
    expect(bounds).toEqual({ maxX: 12, maxY: 10, minX: -4, minY: -4 });
  });
});
