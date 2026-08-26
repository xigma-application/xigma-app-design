// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVertexIdSet } from '../getVertexIdSet';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
  ...overrides,
});

describe('getVertexIdSet', () => {
  it('should include an explicitly given vertex id', () => {
    // result
    expect(getVertexIdSet(buildNode(), ['v1'], [])).toEqual(new Set(['v1']));
  });

  it('should include a selected segment’s own two endpoints', () => {
    // result
    expect(getVertexIdSet(buildNode(), [], ['s1'])).toEqual(new Set(['v1', 'v2']));
  });

  it('should merge explicit vertex ids with segment endpoint ids into one deduplicated set', () => {
    // result
    expect(getVertexIdSet(buildNode(), ['v1'], ['s1'])).toEqual(new Set(['v1', 'v2']));
  });

  it('should contribute no endpoints for a segment id that no longer resolves to any segment', () => {
    // result
    expect(getVertexIdSet(buildNode(), [], ['stale'])).toEqual(new Set());
  });
});
