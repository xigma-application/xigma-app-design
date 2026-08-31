// types
import { NodeType } from 'types/design/enums';

// utils
import { buildVectorNodeFromEdgeLoops } from '../buildVectorNodeFromEdgeLoops';
import { groupFilledFacesByColor } from 'utils/canvas/drawVectorNode/groupFilledFacesByColor';
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

const BASE = { id: 'glyph-1', name: 'o', parentId: 'text-1', rotation: 0 };

const squareEdges: TLoopEdge[] = [
  { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 10, y: 10 }, start: { x: 10, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 10 }, start: { x: 10, y: 10 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 0 }, start: { x: 0, y: 10 }, tangentEnd: null, tangentStart: null },
];

describe('buildVectorNodeFromEdgeLoops', () => {
  it('should build a single-face vector node from one closed edge loop, preserving curve tangents', () => {
    // mock — a loop with one curved edge (a real tangent) mixed with straight ones
    const curvedEdges: TLoopEdge[] = [
      { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: { x: -2, y: 3 }, tangentStart: { x: 2, y: -3 } },
      { end: { x: 10, y: 10 }, start: { x: 10, y: 0 }, tangentEnd: null, tangentStart: null },
      { end: { x: 0, y: 10 }, start: { x: 10, y: 10 }, tangentEnd: null, tangentStart: null },
      { end: { x: 0, y: 0 }, start: { x: 0, y: 10 }, tangentEnd: null, tangentStart: null },
    ];

    // action
    const result = buildVectorNodeFromEdgeLoops([curvedEdges], BASE, '#ff0000');

    // result
    expect(result?.type).toBe(NodeType.vector);
    expect(result?.fillColor).toBe('#ff0000');
    expect(Object.keys(result?.vertices ?? {})).toHaveLength(4);
    expect(Object.values(result?.segments ?? {}).some((segment) => segment.tangentStart !== null)).toBe(true);
    expect(result?.filledFaceKeys).toHaveLength(1);
  });

  it('should build a ring-shaped vector node from an outer and an inner closed edge loop', () => {
    // mock — a smaller inner square nested inside the outer one, e.g. the two contours of an "o"
    const innerEdges: TLoopEdge[] = [
      { end: { x: 8, y: 2 }, start: { x: 2, y: 2 }, tangentEnd: null, tangentStart: null },
      { end: { x: 8, y: 8 }, start: { x: 8, y: 2 }, tangentEnd: null, tangentStart: null },
      { end: { x: 2, y: 8 }, start: { x: 8, y: 8 }, tangentEnd: null, tangentStart: null },
      { end: { x: 2, y: 2 }, start: { x: 2, y: 8 }, tangentEnd: null, tangentStart: null },
    ];

    // action
    const result = buildVectorNodeFromEdgeLoops([squareEdges, innerEdges], BASE, '#ff0000');

    // result — outer and inner loop each stay their own independent, independently-resolvable face
    expect(Object.keys(result?.vertices ?? {})).toHaveLength(8);
    expect(result?.filledFaceKeys).toHaveLength(2);
    expect(groupFilledFacesByColor(result!).get('#ff0000')).toHaveLength(2);
  });

  it('should drop a degenerate loop with fewer than 3 edges', () => {
    // action
    const result = buildVectorNodeFromEdgeLoops(
      [squareEdges, [{ end: { x: 6, y: 6 }, start: { x: 5, y: 5 }, tangentEnd: null, tangentStart: null }]],
      BASE,
      '#ff0000',
    );

    // result
    expect(Object.keys(result?.vertices ?? {})).toHaveLength(4);
  });

  it('should return null when given no edge loops at all', () => {
    // action
    const result = buildVectorNodeFromEdgeLoops([], BASE, '#ff0000');

    // result
    expect(result).toBeNull();
  });
});
