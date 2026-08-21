// store
import { addNode, setVectorEditingNodeId } from 'store/design/slice';
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
  handleOrigins: {},
  hasMoved: false,
  nodeId: 'path-1',
  pendingClickAction: null,
  pointerStart: { x: 0, y: 0 },
  vertexOrigins: {},
  ...overrides,
});

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

describe('applyPendingClickAction', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should do nothing when there is no pending click action', () => {
    // mock
    const canvasRefs = createCanvasRefs({ selectedVectorSegmentIdsRef: { current: ['s1'] } });

    // before
    applyPendingClickAction(store.dispatch, canvasRefs, baseDragState({ pendingClickAction: null }));

    // result
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
  });

  it('should select only the pending vertex for a "vertex" action', () => {
    // mock
    const canvasRefs = createCanvasRefs({ selectedVectorVertexIdsRef: { current: ['v1', 'v2'] } });

    // before
    applyPendingClickAction(store.dispatch, canvasRefs, baseDragState({ pendingClickAction: { id: 'v2', kind: 'vertex' } }));

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v2']);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should select only the pending handle for a "handle" action', () => {
    // mock
    const canvasRefs = createCanvasRefs({ selectedVectorVertexIdsRef: { current: ['v1'] } });

    // before
    applyPendingClickAction(
      store.dispatch,
      canvasRefs,
      baseDragState({ pendingClickAction: { end: 'start', kind: 'handle', segmentId: 's1' } }),
    );

    // result
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should select only the pending segment for a "segment" action', () => {
    // mock
    const canvasRefs = createCanvasRefs({ selectedVectorSegmentIdsRef: { current: ['s1', 's2'] } });

    // before
    applyPendingClickAction(store.dispatch, canvasRefs, baseDragState({ pendingClickAction: { id: 's1', kind: 'segment' } }));

    // result
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should split the segment and select the new vertex for a "split-segment" action', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvasRefs = createCanvasRefs({ selectedVectorSegmentIdsRef: { current: ['s1'] } });

    // before
    applyPendingClickAction(
      store.dispatch,
      canvasRefs,
      baseDragState({ nodeId, pendingClickAction: { kind: 'split-segment', segmentId: 's1', t: 0.5 } }),
    );

    // result
    const updatedNode = store.getState().design.nodes[nodeId] as TVectorNode;
    const [newVertexId] = canvasRefs.selectedVectorVertexIdsRef.current;

    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
  });
});
