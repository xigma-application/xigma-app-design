// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getBoxStrokePolygons } from '../getBoxStrokePolygons';
import { getQuarterTaperBoxStrokePolygons } from '../getQuarterTaperBoxStrokePolygons';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 10,
  y: 20,
  ...overrides,
});

describe('getQuarterTaperBoxStrokePolygons', () => {
  it('should subdivide the outer polygon for a finer loop-position sample while tracing the same outline', () => {
    // before
    const node = rect();

    // action
    const [outer] = getQuarterTaperBoxStrokePolygons(node, 4, StrokeAlign.inside, false);
    const [uniformOuter] = getBoxStrokePolygons(node, { bottom: 4, left: 4, right: 4, top: 4 }, StrokeAlign.inside);

    // result
    expect(outer.length).toBeGreaterThan(uniformOuter.length);
    expect(outer[0]).toEqual(uniformOuter[0]);
  });

  it('should keep the inner and outer loops the same length', () => {
    // before
    const node = rect();

    // action
    const [outer, inner] = getQuarterTaperBoxStrokePolygons(node, 4, StrokeAlign.inside, false);

    // result
    expect(inner.length).toBe(outer.length);
  });

  it('should flip so the bump-and-descent moves to the other side of the seam', () => {
    // before
    const node = rect();

    // action
    const [outer, inner] = getQuarterTaperBoxStrokePolygons(node, 4, StrokeAlign.inside, true);
    const [, uniformInner] = getBoxStrokePolygons(node, { bottom: 4, left: 4, right: 4, top: 4 }, StrokeAlign.inside);

    // result — flipped, position 0 (loop start) is now the thin end instead of the full-width base
    expect(inner[0]).not.toEqual(uniformInner[0]);
    expect(inner[0]).not.toEqual(outer[0]);
  });
});
