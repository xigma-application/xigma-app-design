// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitVectorCornerHandleDrag } from '../commitVectorCornerHandleDrag';
import { createCanvasRefs } from '../../hooks/useCanvasRefs/createCanvasRefs';
import { getVectorEditingNode } from '../getVectorEditingNode';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('commitVectorCornerHandleDrag', () => {
  it('should mark the vertex symmetric, select only the new handle, and arm the handle-drag ref', () => {
    // mock
    const nodeId = addVectorNode();
    const node = getVectorEditingNode(store.getState().design.nodes, nodeId) as TVectorNode;
    const canvasRefs = createCanvasRefs();
    const vectorHandleDragRef = { current: null };

    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    commitVectorCornerHandleDrag(node, 'v1', { end: 'start', segmentId: 's1' }, store.dispatch, canvasRefs, vectorHandleDragRef);

    // result
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updated.vertexHandleModes).toEqual({ v1: 'symmetric' });
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(vectorHandleDragRef.current).toEqual({ end: 'start', nodeId, segmentId: 's1', vertexId: 'v1' });
  });
});
