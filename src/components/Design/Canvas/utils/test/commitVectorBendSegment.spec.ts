// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitVectorBendSegment } from '../commitVectorBendSegment';
import { createCanvasRefs } from '../../hooks/useCanvasRefs/createCanvasRefs';
import { getVectorEditingNode } from '../getVectorEditingNode';

const addVectorNode = (segments: TVectorNode['segments']): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 90, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('commitVectorBendSegment', () => {
  it('should write straight-line-equivalent default tangents, mark both endpoints symmetric, and select the segment', () => {
    // mock
    const nodeId = addVectorNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } });
    const node = getVectorEditingNode(store.getState().design.nodes, nodeId) as TVectorNode;
    const canvasRefs = createCanvasRefs();
    const dragRef = { current: null };

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];
    canvasRefs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    commitVectorBendSegment(node, 's1', { x: 5, y: 5 }, store.dispatch, canvasRefs, dragRef);

    // result
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updated.segments.s1.tangentStart).toEqual({ x: 30, y: 0 });
    expect(updated.segments.s1.tangentEnd).toEqual({ x: -30, y: 0 });
    expect(updated.vertexHandleModes).toEqual({ v1: 'symmetric', v2: 'symmetric' });
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(dragRef.current).toEqual({
      dragStart: { x: 5, y: 5 },
      nodeId,
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      status: 'committed',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    });
  });

  it('should keep the segment’s existing tangents instead of overwriting them when it already has real ones', () => {
    // mock
    const nodeId = addVectorNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -10, y: 20 }, tangentStart: { x: 10, y: 20 } },
    });
    const node = getVectorEditingNode(store.getState().design.nodes, nodeId) as TVectorNode;
    const canvasRefs = createCanvasRefs();
    const dragRef = { current: null };

    // before
    commitVectorBendSegment(node, 's1', { x: 0, y: 0 }, store.dispatch, canvasRefs, dragRef);

    // result
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updated.segments.s1.tangentStart).toEqual({ x: 10, y: 20 });
    expect(updated.segments.s1.tangentEnd).toEqual({ x: -10, y: 20 });
    expect(dragRef.current).toEqual(
      expect.objectContaining({ originalTangentEnd: { x: -10, y: 20 }, originalTangentStart: { x: 10, y: 20 } }),
    );
  });
});
