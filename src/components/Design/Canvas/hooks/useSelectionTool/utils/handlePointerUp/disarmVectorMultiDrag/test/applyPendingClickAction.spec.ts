// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { applyPendingClickAction } from '../applyPendingClickAction';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';

const baseDragState = (overrides: Partial<TVectorMultiDragState>): TVectorMultiDragState => ({
  boxOrigin: null,
  dispatchThrottle: { frameId: null, run: null },
  handleOrigins: {},
  hasMoved: false,
  pendingClickAction: null,
  pointerStart: { x: 0, y: 0 },
  vertexOrigins: {},
  ...overrides,
});

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
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

describe('applyPendingClickAction', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing when there is no pending click action', () => {
    // mock
    const canvasRefs = createCanvasRefs({ vectorEdit: { selectedVectorSegmentIdsRef: { current: ['s1'] } } });

    // before
    applyPendingClickAction(store.dispatch, canvasRefs, baseDragState({ pendingClickAction: null }));

    // result
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
  });

  it('should select only the pending vertex for a "vertex" action', () => {
    // mock
    const canvasRefs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1', 'v2'] } } });

    // before
    applyPendingClickAction(store.dispatch, canvasRefs, baseDragState({ pendingClickAction: { id: 'v2', kind: 'vertex' } }));

    // result
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['v2']);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should select only the pending handle for a "handle" action', () => {
    // mock
    const canvasRefs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } });

    // before
    applyPendingClickAction(
      store.dispatch,
      canvasRefs,
      baseDragState({ pendingClickAction: { end: 'start', kind: 'handle', segmentId: 's1' } }),
    );

    // result
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should select only the pending segment for a "segment" action', () => {
    // mock
    const canvasRefs = createCanvasRefs({ vectorEdit: { selectedVectorSegmentIdsRef: { current: ['s1', 's2'] } } });

    // before
    applyPendingClickAction(store.dispatch, canvasRefs, baseDragState({ pendingClickAction: { id: 's1', kind: 'segment' } }));

    // result
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should split the segment and select the new vertex for a "split-segment" action', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs({ vectorEdit: { selectedVectorSegmentIdsRef: { current: ['s1'] } } });

    // before
    applyPendingClickAction(
      store.dispatch,
      canvasRefs,
      baseDragState({ pendingClickAction: { kind: 'split-segment', nodeId, segmentId: 's1', t: 0.5 } }),
    );

    // result
    const updatedNode = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const [newVertexId] = canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current;

    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
  });
});
