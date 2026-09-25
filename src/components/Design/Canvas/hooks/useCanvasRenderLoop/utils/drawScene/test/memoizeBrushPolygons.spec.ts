// utils
import { memoizeBrushPolygons } from '../memoizeBrushPolygons';

describe('memoizeBrushPolygons', () => {
  it('should compute the polygons once per key and reuse them, including an empty result', () => {
    // mock
    const compute = vi.fn(() => [[{ x: 0, y: 0 }]]);
    const computeNull = vi.fn(() => null);

    // before
    const first = memoizeBrushPolygons('memo-a', compute);
    const second = memoizeBrushPolygons('memo-a', compute);
    memoizeBrushPolygons('memo-null', computeNull);

    // result
    expect(second).toBe(first);
    expect(compute).toHaveBeenCalledTimes(1);
    expect(memoizeBrushPolygons('memo-null', computeNull)).toBeNull();
    expect(computeNull).toHaveBeenCalledTimes(1);
  });

  it('should forget the oldest keys once the cache is full', () => {
    // mock
    const compute = vi.fn(() => []);

    // before
    memoizeBrushPolygons('evict-0', compute);
    Array.from({ length: 6 }, (_, index) => memoizeBrushPolygons(`evict-${index + 1}`, () => []));
    memoizeBrushPolygons('evict-0', compute);

    // result
    expect(compute).toHaveBeenCalledTimes(2);
  });
});
