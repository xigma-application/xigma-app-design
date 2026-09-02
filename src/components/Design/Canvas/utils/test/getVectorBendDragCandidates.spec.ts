// types
import { NodeType } from 'types/design/enums';
import { TVectorEdgeMatch } from '../getVectorEdgeAtPoint';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorBendDragCandidates } from '../getVectorBendDragCandidates';

const buildNode = (vertices: Record<string, TVectorVertex>, segments: Record<string, TVectorSegment>): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

const buildMatch = (segmentId: string): TVectorEdgeMatch => ({ point: { x: 0, y: 0 }, segmentId, snapped: false, t: 0 });

describe('getVectorBendDragCandidates', () => {
  it('should point each candidate away from the endpoint nearest the click, toward the far endpoint', () => {
    // mock — v1 is the shared vertex both segments extend away from
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 0, y: 10 } },
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v1', tangentEnd: null, tangentStart: null },
      },
    );

    // action — clicked right next to v1
    const candidates = getVectorBendDragCandidates([buildMatch('s1'), buildMatch('s2')], node, { x: 0.5, y: 0.5 });

    // result — s1 points toward v2 (0°, "right"), s2 points toward v3 (90°, "down")
    expect(candidates).toEqual([
      { angle: 0, segmentId: 's1' },
      { angle: 90, segmentId: 's2' },
    ]);
  });

  it('should point the candidate away from whichever endpoint is nearest, even when that is the segment’s end vertex', () => {
    // mock — clicking near v2 instead of v1 means the "near" vertex is the segment's endId, not startId
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const candidates = getVectorBendDragCandidates([buildMatch('s1')], node, { x: 9.5, y: 0.5 });

    // result — points back toward v1 (180°, "left"), away from the near vertex v2
    expect(candidates).toEqual([{ angle: 180, segmentId: 's1' }]);
  });
});
