// types
import { TBatchShape } from '../types';

// utils
import { appendShapeTriangles } from '../appendShapeTriangles';
import { createRectBatch } from '../createRectBatch';

const rectangle = (overrides: Record<string, unknown> = {}): TBatchShape =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 20,
    id: 'r',
    name: 'r',
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: 40,
    x: 0,
    y: 0,
    ...overrides,
  }) as unknown as TBatchShape;

describe('appendShapeTriangles', () => {
  it('should emit a single quad for a square-cornered rectangle', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendShapeTriangles(batch, rectangle(), 1);

    // result — 6 vertices x 6 floats
    expect(batch.floatCount).toBe(36);
  });

  it('should emit a fan with many triangles for a rounded rectangle', () => {
    // mock
    const batch = createRectBatch();

    // before
    appendShapeTriangles(batch, rectangle({ cornerRadius: 6 }), 1);

    // result
    expect(batch.floatCount).toBeGreaterThan(36 * 4);
  });

  it('should emit a fan for an ellipse', () => {
    // mock
    const batch = createRectBatch();
    const ellipse = {
      fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      height: 20,
      id: 'e',
      name: 'e',
      parentId: null,
      rotation: 0,
      type: 'ellipse',
      width: 40,
      x: 0,
      y: 0,
    };

    // before
    appendShapeTriangles(batch, ellipse as unknown as TBatchShape, 1);

    // result
    expect(batch.floatCount).toBeGreaterThan(36 * 4);
    expect(Array.from(batch.data.subarray(2, 5))).toEqual([0, 1, 0]);
  });

  it('should add the stroke ring after the fill of a stroked rectangle', () => {
    // mock
    const plain = createRectBatch();
    const stroked = createRectBatch();

    // before
    appendShapeTriangles(plain, rectangle(), 1);
    appendShapeTriangles(stroked, rectangle({ strokeWidth: 2, strokes: [{ color: '#0000ff', opacity: 100, type: 'solid' }] }), 1);

    // result
    expect(stroked.floatCount).toBeGreaterThan(plain.floatCount);
    expect(Array.from(stroked.data.subarray(2, 5))).toEqual([1, 0, 0]);
    expect(Array.from(stroked.data.subarray(plain.floatCount + 2, plain.floatCount + 5))).toEqual([0, 0, 1]);
  });
});
