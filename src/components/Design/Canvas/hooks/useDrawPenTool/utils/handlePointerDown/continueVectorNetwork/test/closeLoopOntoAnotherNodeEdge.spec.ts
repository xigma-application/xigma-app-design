import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { closeLoopOntoAnotherNodeEdge } from '../closeLoopOntoAnotherNodeEdge';

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });
const createPendingOutgoingTangentRef = (value: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: value,
});

const addSourceNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: ['a1,a2,a3'],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a1: { id: 'a1', x: 0, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addTargetNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: ['b1,b2,b3'],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b2', id: 's1', startId: 'b1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { b1: { id: 'b1', x: 100, y: 0 }, b2: { id: 'b2', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('closeLoopOntoAnotherNodeEdge', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId('a1'));
  });

  it('should split the target edge, absorb the target node into the source node, delete the target, and prune it from the open set', () => {
    // mock — a1 on node A closes onto the midpoint of the b1-b2 edge on node B
    const sourceId = addSourceNode();
    const targetId = addTargetNode();
    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const sourceNode = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;
    const targetNode = store.getState().design.pages[store.getState().design.activePageId].nodes[targetId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 1, y: 1 }, vertexId: 'a1' });

    // before
    closeLoopOntoAnotherNodeEdge(
      { x: 100, y: 50 },
      sourceNode,
      targetNode,
      'a1',
      's1',
      0.5,
      'segment-connect',
      null,
      [sourceId, targetId],
      store.dispatch,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
    );

    // result
    const state = store.getState();
    const updatedSource = state.design.pages[state.design.activePageId].nodes[sourceId] as TVectorNode;
    const newVertexId = updatedSource.segments.s1.endId;

    expect(state.design.pages[state.design.activePageId].nodes[targetId]).toBeUndefined();
    expect(newVertexId).not.toBe('b1');
    expect(newVertexId).not.toBe('b2');
    expect(updatedSource.vertices[newVertexId]).toEqual({ id: newVertexId, x: 100, y: 50 });
    expect(updatedSource.segments['segment-connect']).toMatchObject({ endId: newVertexId, startId: 'a1', tangentStart: null });
    expect(updatedSource.filledFaceKeys).toEqual(expect.arrayContaining(['a1,a2,a3', 'b1,b2,b3']));
    expect(state.design.vectorEditingNodeIds).toEqual([sourceId]);
    expect(state.design.penActiveVertexId).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(dragOriginRef.current).toEqual({ nodeId: sourceId, segmentId: 'segment-connect', vertexId: newVertexId });
    expect(dragStartRef.current).toEqual({ x: 100, y: 50 });
  });

  it('should carry the given tangentStart onto the connecting segment', () => {
    // mock
    const sourceId = addSourceNode();
    const targetId = addTargetNode();
    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const sourceNode = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;
    const targetNode = store.getState().design.pages[store.getState().design.activePageId].nodes[targetId] as TVectorNode;

    // before
    closeLoopOntoAnotherNodeEdge(
      { x: 100, y: 50 },
      sourceNode,
      targetNode,
      'a1',
      's1',
      0.5,
      'segment-connect',
      { x: 5, y: 5 },
      [sourceId, targetId],
      store.dispatch,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
    );

    // result
    const updatedSource = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;

    expect(updatedSource.segments['segment-connect'].tangentStart).toEqual({ x: 5, y: 5 });
  });
});
