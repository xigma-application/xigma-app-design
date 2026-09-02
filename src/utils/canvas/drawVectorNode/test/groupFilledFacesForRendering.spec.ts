// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { groupFilledFacesForRendering } from '../groupFilledFacesForRendering';

const getVectorFillLoopPointsMock = vi.fn();

vi.mock('../../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (...args: unknown[]): unknown => getVectorFillLoopPointsMock(...args),
}));

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];

const baseNode: TVectorNode = {
  defaultFill: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  fillByKey: {},
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

const setPoints = (byKey: Record<string, TPoint[]>): void => {
  getVectorFillLoopPointsMock.mockImplementation((_n: TVectorNode, key: string) => byKey[key] ?? null);
};

const solid = (color: string): TPaint[] => [{ color, opacity: 100, type: 'solid' }];

describe('groupFilledFacesForRendering', () => {
  beforeEach(() => {
    getVectorFillLoopPointsMock.mockReset();
  });

  it('should return an empty array when the node has no filled faces', () => {
    expect(groupFilledFacesForRendering(baseNode)).toEqual([]);
  });

  it('should merge two ordinary faces of the same color into one group, same as an unrelated glyph outer/inner counter', () => {
    // mock — neither face carries a holeParentByKey entry, so this is the plain, pre-existing mechanism
    const node: TVectorNode = {
      ...baseNode,
      fillByKey: { inner: solid('#111111'), outer: solid('#111111') },
      filledFaceKeys: ['outer', 'inner'],
    };

    setPoints({ inner: square(20, 20, 10), outer: square(0, 0, 100) });

    // result
    const result = groupFilledFacesForRendering(node);

    expect(result).toEqual([{ paint: solid('#111111'), polygons: [square(0, 0, 100), square(20, 20, 10)] }]);
  });

  it('should keep two ordinary faces of different colors in separate groups', () => {
    // mock
    const node: TVectorNode = {
      ...baseNode,
      fillByKey: { a: solid('#111111'), c: solid('#222222') },
      filledFaceKeys: ['a', 'c'],
    };

    setPoints({ a: square(0, 0, 10), c: square(200, 200, 10) });

    // result
    const result = groupFilledFacesForRendering(node);

    expect(result).toEqual([
      { paint: solid('#111111'), polygons: [square(0, 0, 10)] },
      { paint: solid('#222222'), polygons: [square(200, 200, 10)] },
    ]);
  });

  it('should merge an active hole into its recorded parent’s own group', () => {
    // mock — B is nested inside A, both the same color, and holeParentByKey records B as A's hole
    const node: TVectorNode = {
      ...baseNode,
      fillByKey: { a: solid('#d9d9d9'), b: solid('#d9d9d9') },
      filledFaceKeys: ['a', 'b'],
      holeParentByKey: { b: 'a' },
    };

    setPoints({ a: square(0, 0, 100), b: square(20, 20, 10) });

    // result
    const result = groupFilledFacesForRendering(node);

    expect(result).toEqual([{ paint: solid('#d9d9d9'), polygons: [square(0, 0, 100), square(20, 20, 10)] }]);
  });

  it('should isolate a former hole into its own group once it is no longer geometrically nested in its recorded parent', () => {
    // mock — B was cut from A, but has since been dragged away; both still literally share A's color,
    // which is exactly the coincidence that must NOT cause B to cancel out against A or anything else
    const node: TVectorNode = {
      ...baseNode,
      fillByKey: { a: solid('#d9d9d9'), b: solid('#d9d9d9') },
      filledFaceKeys: ['a', 'b'],
      holeParentByKey: { b: 'a' },
    };

    setPoints({ a: square(0, 0, 100), b: square(500, 500, 10) });

    // result
    const result = groupFilledFacesForRendering(node);

    expect(result).toEqual([
      { paint: solid('#d9d9d9'), polygons: [square(0, 0, 100)] },
      { paint: solid('#d9d9d9'), polygons: [square(500, 500, 10)] },
    ]);
  });

  it('should isolate a former hole into its own group once its recorded parent’s color has drifted away from it', () => {
    // mock — B still sits inside A, but A was recolored since the hole was cut; B keeps its own frozen
    // color as a plain, independent fill instead of remaining tied to A's new color
    const node: TVectorNode = {
      ...baseNode,
      fillByKey: { a: solid('#222222'), b: solid('#d9d9d9') },
      filledFaceKeys: ['a', 'b'],
      holeParentByKey: { b: 'a' },
    };

    setPoints({ a: square(0, 0, 100), b: square(20, 20, 10) });

    // result
    const result = groupFilledFacesForRendering(node);

    expect(result).toEqual([
      { paint: solid('#222222'), polygons: [square(0, 0, 100)] },
      { paint: solid('#d9d9d9'), polygons: [square(20, 20, 10)] },
    ]);
  });

  it('should skip a loop key that no longer resolves to any points', () => {
    // mock
    const node: TVectorNode = { ...baseNode, filledFaceKeys: ['stale'] };

    setPoints({});

    // result
    expect(groupFilledFacesForRendering(node)).toEqual([]);
  });
});
