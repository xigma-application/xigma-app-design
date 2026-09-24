// utils
import { createRectBatch } from '../createRectBatch';
import { pushPolygonFan } from '../pushPolygonFan';

describe('pushPolygonFan', () => {
  it('should emit one triangle around the center per polygon edge, closing back to the first point', () => {
    // mock
    const batch = createRectBatch();
    const center = { x: 5, y: 5 };
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    // before
    pushPolygonFan(batch, center, points, [1, 0.5, 0.25], 0.75);

    // result — 3 triangles x 3 vertices x 6 floats
    expect(batch.floatCount).toBe(54);
    expect(Array.from(batch.data.subarray(0, 12))).toEqual([5, 5, 1, 0.5, 0.25, 0.75, 0, 0, 1, 0.5, 0.25, 0.75]);
    expect(Array.from(batch.data.subarray(48, 54))).toEqual([0, 0, 1, 0.5, 0.25, 0.75]);
    expect(Array.from(batch.data.subarray(42, 44))).toEqual([10, 10]);
  });

  it('should append after what the batch already holds and grow its storage when needed', () => {
    // mock
    const batch = createRectBatch();
    const points = Array.from({ length: 200 }, (_, index) => ({ x: index, y: 0 }));

    // before
    pushPolygonFan(batch, { x: 0, y: 0 }, points, [0, 0, 0], 1);
    pushPolygonFan(batch, { x: 0, y: 0 }, points, [0, 0, 0], 1);

    // result
    expect(batch.floatCount).toBe(2 * 200 * 18);
  });
});
