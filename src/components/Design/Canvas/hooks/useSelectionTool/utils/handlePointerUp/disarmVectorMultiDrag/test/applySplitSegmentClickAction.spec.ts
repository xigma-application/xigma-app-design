// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { applySplitSegmentClickAction } from '../applySplitSegmentClickAction';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';

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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('applySplitSegmentClickAction', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should split the segment at t, dispatch the change, and select only the new vertex', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs({
      vectorEdit: { selectedVectorSegmentIdsRef: { current: ['s1'] } },
    });

    // before — t=0.5 along the straight v1(0,0)-v2(100,0) segment lands exactly on its midpoint
    applySplitSegmentClickAction(store.dispatch, canvasRefs, nodeId, 's1', 0.5);

    // result
    const updatedNode = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const [newVertexId] = canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current;

    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toHaveLength(1);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
    expect(Object.keys(updatedNode.segments)).toHaveLength(2);
  });

  it('should do nothing when the vector-editing node can no longer be found', () => {
    // mock — e.g. the node was deleted or edit mode exited between arm and release
    const canvasRefs = createCanvasRefs({
      vectorEdit: { selectedVectorSegmentIdsRef: { current: ['s1'] } },
    });

    // before
    applySplitSegmentClickAction(store.dispatch, canvasRefs, 'missing-node', 's1', 0.5);

    // result — untouched, no crash
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
  });
});
