// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getExpandedSegmentIdSet } from '../getExpandedSegmentIdSet';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 20, y: 0 } },
  ...overrides,
});

describe('getExpandedSegmentIdSet', () => {
  it('should include an explicitly given segment id', () => {
    // result
    expect(getExpandedSegmentIdSet(buildNode(), ['s1'], new Set())).toEqual(new Set(['s1']));
  });

  it('should auto-include a segment whose both endpoints are already in the given vertex id set', () => {
    // result
    expect(getExpandedSegmentIdSet(buildNode(), [], new Set(['v1', 'v2']))).toEqual(new Set(['s1']));
  });

  it('should not include a segment with only one endpoint in the vertex id set', () => {
    // result
    expect(getExpandedSegmentIdSet(buildNode(), [], new Set(['v1']))).toEqual(new Set());
  });

  it('should merge explicit and auto-included segment ids into one deduplicated set', () => {
    // result — s1 given explicitly, s2 auto-included since both v2/v3 are in the vertex set
    expect(getExpandedSegmentIdSet(buildNode(), ['s1'], new Set(['v2', 'v3']))).toEqual(new Set(['s1', 's2']));
  });
});
