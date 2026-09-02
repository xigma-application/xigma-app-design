// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

const getVectorFillLoopPointsMock = vi.fn();

vi.mock('utils/canvas/vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (...args: unknown[]): unknown => getVectorFillLoopPointsMock(...args),
}));

// utils
import { mergeVectorNodeGeometriesWithHoleDetection } from '../mergeVectorNodeGeometriesWithHoleDetection';

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];
const reversed = (points: TPoint[]): TPoint[] => [...points].reverse();

const buildNode = (overrides: Partial<TVectorNode>): TVectorNode => ({
  defaultFill: [{ color: '#123456', opacity: 100, type: 'solid' }],
  fillByKey: {},
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Contour',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#123456',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

const setPoints = (byKey: Record<string, TPoint[]>): void => {
  getVectorFillLoopPointsMock.mockImplementation((_node: TVectorNode, key: string) => byKey[key] ?? null);
};

const base = { id: 'merged-1', name: 'o', parentId: 'frame-1', rotation: 0 };

describe('mergeVectorNodeGeometriesWithHoleDetection', () => {
  beforeEach(() => {
    getVectorFillLoopPointsMock.mockReset();
  });

  it('should return null when there are no nodes to merge', () => {
    expect(mergeVectorNodeGeometriesWithHoleDetection([], base, '#000')).toBeNull();
  });

  it('should record a genuine hole (opposite winding, nested) — the "o" counter case', () => {
    const node = buildNode({ filledFaceKeys: ['outer', 'hole'] });

    setPoints({ hole: reversed(square(20, 20, 10)), outer: square(0, 0, 100) });

    const result = mergeVectorNodeGeometriesWithHoleDetection([node], base, '#123456');

    expect(result?.holeParentByKey).toEqual({ hole: 'outer' });
    expect(result?.filledFaceKeys).toEqual(['outer', 'hole']);
  });

  it('should detect a hole within one contour’s own multiple self-crossing faces — the "R" bowl case', () => {
    const node = buildNode({ filledFaceKeys: ['bowlOuter', 'bowlHole'] });

    setPoints({ bowlHole: reversed(square(5, 5, 5)), bowlOuter: square(0, 0, 20) });

    const result = mergeVectorNodeGeometriesWithHoleDetection([node], base, '#123456');

    expect(result?.holeParentByKey).toEqual({ bowlHole: 'bowlOuter' });
  });

  it('should isolate a same-direction overlap on both sides instead of treating it as a hole — the "D" stem/bowl case', () => {
    const bowl = buildNode({ filledFaceKeys: ['bowl'], id: 'bowl-node' });
    const stem = buildNode({ filledFaceKeys: ['stem'], id: 'stem-node' });

    // stem sits fully inside the bowl's own bbox, but winds the SAME direction — not a real hole, so
    // neither can rely on cancelling against the other: both must render as independent ink
    setPoints({ bowl: square(0, 0, 100), stem: square(10, 10, 10) });

    const result = mergeVectorNodeGeometriesWithHoleDetection([bowl, stem], base, '#123456');

    expect(result?.holeParentByKey).toEqual({ bowl: '__isolated__bowl', stem: '__isolated__stem' });
    expect(result?.filledFaceKeys.slice().sort()).toEqual(['bowl', 'stem']);
  });

  it('should leave non-overlapping faces from the same self-crossing contour completely untouched — the "x" case', () => {
    const node = buildNode({ filledFaceKeys: ['left', 'right', 'top'] });

    setPoints({ left: square(0, 0, 10), right: square(100, 0, 10), top: square(50, 100, 10) });

    const result = mergeVectorNodeGeometriesWithHoleDetection([node], base, '#123456');

    expect(result?.holeParentByKey).toEqual({});
  });

  it('should merge vertices, segments and fillByKey across every node', () => {
    const nodeA = buildNode({
      fillByKey: { a: [{ color: '#111', opacity: 100, type: 'solid' }] },
      filledFaceKeys: ['a'],
      id: 'node-a',
      segments: { sa: { endId: 'b', id: 'sa', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 1, y: 1 } },
    });
    const nodeB = buildNode({
      fillByKey: { c: [{ color: '#222', opacity: 100, type: 'solid' }] },
      filledFaceKeys: ['c'],
      id: 'node-b',
      segments: { sc: { endId: 'd', id: 'sc', startId: 'c', tangentEnd: null, tangentStart: null } },
      vertices: { c: { id: 'c', x: 5, y: 5 }, d: { id: 'd', x: 6, y: 6 } },
    });

    setPoints({ a: square(0, 0, 10), c: square(100, 100, 10) });

    const result = mergeVectorNodeGeometriesWithHoleDetection([nodeA, nodeB], base, '#123456');

    expect(result?.fillByKey).toEqual({
      a: [{ color: '#111', opacity: 100, type: 'solid' }],
      c: [{ color: '#222', opacity: 100, type: 'solid' }],
    });
    expect(Object.keys(result!.vertices).sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(Object.keys(result!.segments).sort()).toEqual(['sa', 'sc']);
    expect(result?.id).toBe(base.id);
    expect(result?.name).toBe(base.name);
    expect(result?.parentId).toBe(base.parentId);
    expect(result?.defaultFill).toEqual([{ color: '#123456', opacity: 100, type: 'solid' }]);
  });

  it('should skip a face key that no longer resolves to any points instead of throwing', () => {
    const node = buildNode({ filledFaceKeys: ['ghost'] });

    setPoints({});

    const result = mergeVectorNodeGeometriesWithHoleDetection([node], base, '#123456');

    expect(result?.holeParentByKey).toEqual({});
    expect(result?.filledFaceKeys).toEqual(['ghost']);
  });
});
