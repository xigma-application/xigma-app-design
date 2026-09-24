// types
import { TRectangleNode } from 'types/design/types';

// utils
import { createRectBatch } from 'utils/canvas/drawRectBatch/createRectBatch';
import { pushRectangleToBatch } from '../pushRectangleToBatch';

const VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createNode = (x: number, y: number, rotation = 0): TRectangleNode =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 20,
    id: 'r',
    name: 'r',
    parentId: null,
    rotation,
    type: 'rectangle',
    width: 20,
    x,
    y,
  }) as unknown as TRectangleNode;

describe('pushRectangleToBatch', () => {
  it('should append a rectangle that is inside the viewport', () => {
    // mock
    const batch = createRectBatch();

    // before
    pushRectangleToBatch(batch, createNode(10, 10), 1, 100, 100, VIEWPORT);

    // result
    expect(batch.floatCount).toBe(36);
  });

  it.each([
    ['left of', -30, 10],
    ['above', 10, -30],
    ['right of', 120, 10],
    ['below', 10, 120],
  ])('should skip an unrotated rectangle entirely %s the viewport', (_, x, y) => {
    // mock
    const batch = createRectBatch();

    // before
    pushRectangleToBatch(batch, createNode(x, y), 1, 100, 100, VIEWPORT);

    // result
    expect(batch.floatCount).toBe(0);
  });

  it('should keep a rotated rectangle whose circumscribed circle still reaches the viewport', () => {
    // mock
    const batch = createRectBatch();

    // before
    pushRectangleToBatch(batch, createNode(-22, 10, 45), 1, 100, 100, VIEWPORT);

    // result
    expect(batch.floatCount).toBe(36);
  });

  it('should keep a stroked rectangle whose stroke still reaches the viewport', () => {
    // mock
    const batch = createRectBatch();
    const stroked = {
      ...createNode(-24, 10),
      strokeWidth: 6,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
    } as unknown as TRectangleNode;

    // before
    pushRectangleToBatch(batch, stroked, 1, 100, 100, VIEWPORT);

    // result
    expect(batch.floatCount).toBeGreaterThan(36);
  });
});
