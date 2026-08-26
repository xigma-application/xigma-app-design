// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorVertexDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorVertexMerge } from '../resolveVectorVertexMerge';

const buildVectorNode = (overrides: Partial<TVectorNode>): TVectorNode => ({
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

describe('resolveVectorVertexMerge', () => {
  it('should snap the dragged vertex onto a nearby target, record the merge target, null the alignment guide, and switch to the point cursor', () => {
    // mock
    const target = buildVectorNode({ id: 'target-node', vertices: { target: { id: 'target', x: 10, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { 'target-node': target };
    const draggedVertices = { v1: { id: 'v1', x: 8, y: 1 } };
    const dragState: TVectorVertexDragState = {
      dispatchThrottle: { frameId: null, run: null },
      nodeId: 'own-node',
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };
    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorAlignmentGuideRef.current = { horizontal: null, vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 0 } } };

    const setClassName = vi.fn();

    // before
    resolveVectorVertexMerge(draggedVertices, dragState, nodes, null, 5, canvasRefs, setClassName);

    // result
    expect(draggedVertices.v1).toEqual({ id: 'v1', x: 10, y: 0 });
    expect(dragState.mergeTarget).toEqual({ nodeId: 'target-node', vertexId: 'target' });
    expect(canvasRefs.vectorAlignmentGuideRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('point');
  });

  it('should clear the merge target and fall back to the given alignment guide when no vertex is within tolerance', () => {
    // mock
    const nodes: Record<string, TSceneNode> = {};
    const draggedVertices = { v1: { id: 'v1', x: 8, y: 1 } };
    const dragState = {
      dispatchThrottle: { frameId: null, run: null },
      mergeTarget: { nodeId: 'stale-node', vertexId: 'stale-vertex' },
      nodeId: 'own-node',
      origins: { v1: { x: 0, y: 0 } },
      pointerStart: { x: 0, y: 0 },
    };
    const canvasRefs = createCanvasRefs();
    const guide = { horizontal: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 0 } }, vertical: null };
    const setClassName = vi.fn();

    // before
    resolveVectorVertexMerge(draggedVertices, dragState, nodes, guide, 5, canvasRefs, setClassName);

    // result
    expect(dragState.mergeTarget).toBeNull();
    expect(canvasRefs.vectorAlignmentGuideRef.current).toBe(guide);
    expect(setClassName).toHaveBeenCalledWith('move');
  });
});
