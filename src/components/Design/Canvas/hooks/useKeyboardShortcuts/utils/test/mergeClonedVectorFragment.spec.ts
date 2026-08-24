// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { mergeClonedVectorFragment } from '../mergeClonedVectorFragment';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('mergeClonedVectorFragment', () => {
  it('should merge freshly-ided, offset vertices into the target node without touching its existing ones', () => {
    // mock
    const targetNode = buildNode({ vertices: { existing: { id: 'existing', x: 0, y: 0 } } });
    const fragment = { filledFacePieceKeySets: [], segments: [], vertexHandleModes: {}, vertices: [{ id: 'v1', x: 10, y: 10 }] };

    // action
    const merged = mergeClonedVectorFragment(targetNode, fragment, 5, 5);

    // result
    expect(merged.newVertexIds).toHaveLength(1);

    const [newVertexId] = merged.newVertexIds;

    expect(newVertexId).not.toBe('v1');
    expect((merged.changes as Partial<TVectorNode>).vertices).toMatchObject({
      existing: { id: 'existing', x: 0, y: 0 },
      [newVertexId]: { id: newVertexId, x: 15, y: 15 },
    });
  });

  it('should remap a cloned segment onto the newly-ided vertices, preserving its tangents', () => {
    // mock
    const targetNode = buildNode();
    const fragment = {
      filledFacePieceKeySets: [],
      segments: [{ endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: 1, y: 1 }, tangentStart: null }],
      vertexHandleModes: {},
      vertices: [
        { id: 'v1', x: 0, y: 0 },
        { id: 'v2', x: 10, y: 0 },
      ],
    };

    // action
    const merged = mergeClonedVectorFragment(targetNode, fragment, 0, 0);

    // result
    expect(merged.newSegmentIds).toHaveLength(1);

    const [newSegmentId] = merged.newSegmentIds;
    const newSegment = ((merged.changes as Partial<TVectorNode>).segments as Record<string, unknown>)[newSegmentId] as {
      endId: string;
      startId: string;
      tangentEnd: { x: number; y: number } | null;
    };

    expect(merged.newVertexIds).toContain(newSegment.startId);
    expect(merged.newVertexIds).toContain(newSegment.endId);
    expect(newSegment.tangentEnd).toEqual({ x: 1, y: 1 });
  });

  it('should remap vertexHandleModes onto the newly-ided vertex', () => {
    // mock
    const targetNode = buildNode();
    const fragment = {
      filledFacePieceKeySets: [],
      segments: [],
      vertexHandleModes: { v1: 'corner' as const },
      vertices: [{ id: 'v1', x: 0, y: 0 }],
    };

    // action
    const merged = mergeClonedVectorFragment(targetNode, fragment, 0, 0);

    // result
    const [newVertexId] = merged.newVertexIds;

    expect((merged.changes as Partial<TVectorNode>).vertexHandleModes).toEqual({ [newVertexId]: 'corner' });
  });
});
