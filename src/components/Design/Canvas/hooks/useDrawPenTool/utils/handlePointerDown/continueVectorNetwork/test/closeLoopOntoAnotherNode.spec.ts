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
import { closeLoopOntoAnotherNode } from '../closeLoopOntoAnotherNode';

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });
const createPendingOutgoingTangentRef = (value: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: value,
});

const addVectorNode = (vertices: TVectorNode['vertices'], filledFaceKeys: string[] = []): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('closeLoopOntoAnotherNode', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId('a1'));
  });

  it('should absorb the target node into the source node, delete the target, and prune it from the open set', () => {
    // mock — a1 on node A is actively extended and closes onto b1 on node B
    const sourceId = addVectorNode({ a1: { id: 'a1', x: 0, y: 0 } }, ['a1,a2,a3']);
    const targetId = addVectorNode({ b1: { id: 'b1', x: 100, y: 100 } }, ['b1,b2,b3']);
    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const sourceNode = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;
    const targetNode = store.getState().design.pages[store.getState().design.activePageId].nodes[targetId] as TVectorNode;
    const dragOriginRef = createDragOriginRef();
    const dragStartRef = createDragStartRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 1, y: 1 }, vertexId: 'a1' });

    // before
    closeLoopOntoAnotherNode(
      { x: 100, y: 100 },
      sourceNode,
      targetNode,
      'a1',
      'b1',
      'segment-1',
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

    expect(state.design.pages[state.design.activePageId].nodes[targetId]).toBeUndefined();
    expect(updatedSource.vertices).toHaveProperty('a1');
    expect(updatedSource.vertices).toHaveProperty('b1');
    expect(updatedSource.segments['segment-1']).toMatchObject({ endId: 'b1', startId: 'a1', tangentStart: null });
    expect(updatedSource.filledFaceKeys).toEqual(expect.arrayContaining(['a1,a2,a3', 'b1,b2,b3']));
    expect(state.design.vectorEditingNodeIds).toEqual([sourceId]);
    expect(state.design.penActiveVertexId).toBeNull();
    expect(pendingOutgoingTangentRef.current).toBeNull();
    expect(dragOriginRef.current).toEqual({ nodeId: sourceId, segmentId: 'segment-1', vertexId: 'b1' });
    expect(dragStartRef.current).toEqual({ x: 100, y: 100 });
  });

  it('should carry the given tangentStart onto the connecting segment', () => {
    // mock
    const sourceId = addVectorNode({ a1: { id: 'a1', x: 0, y: 0 } });
    const targetId = addVectorNode({ b1: { id: 'b1', x: 100, y: 100 } });
    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const sourceNode = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;
    const targetNode = store.getState().design.pages[store.getState().design.activePageId].nodes[targetId] as TVectorNode;

    // before
    closeLoopOntoAnotherNode(
      { x: 100, y: 100 },
      sourceNode,
      targetNode,
      'a1',
      'b1',
      'segment-1',
      { x: 5, y: 5 },
      [sourceId, targetId],
      store.dispatch,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
    );

    // result
    const updatedSource = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;

    expect(updatedSource.segments['segment-1'].tangentStart).toEqual({ x: 5, y: 5 });
  });
});
