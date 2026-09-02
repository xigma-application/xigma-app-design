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
import { applyContinueVectorNetworkHit } from '../applyContinueVectorNetworkHit';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createDragOriginRef = (): RefObject<TPenDragOrigin | null> => ({ current: null });
const createDragStartRef = (): RefObject<TPoint | null> => ({ current: null });
const createPendingOutgoingTangentRef = (): RefObject<TPendingOutgoingTangent | null> => ({ current: null });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addVectorNodeWithEdge = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { sb: { endId: 'b', id: 'sb', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 500, y: 0 }, b: { id: 'b', x: 500, y: 100 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('applyContinueVectorNetworkHit', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId('v1'));
  });

  it("should close the loop onto the target vertex for a 'vertex' hit", () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    // before
    applyContinueVectorNetworkHit(
      { kind: 'vertex', vertexId: 'v2' },
      { x: 100, y: 100 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      false,
    );

    // result
    const updatedNode = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const [segment] = Object.values(updatedNode.segments);

    expect(segment).toMatchObject({ endId: 'v2', startId: 'v1' });
    expect(store.getState().design.penActiveVertexId).toBeNull();
  });

  it("should merge into the given target node for a 'crossNodeVertex' hit", () => {
    // mock
    const sourceId = addVectorNode();
    const targetId = addVectorNodeWithEdge();

    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;
    const targetNode = store.getState().design.pages[store.getState().design.activePageId].nodes[targetId] as TVectorNode;

    // before
    applyContinueVectorNetworkHit(
      { kind: 'crossNodeVertex', targetNode, vertexId: 'a' },
      { x: 500, y: 0 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      false,
    );

    // result
    const state = store.getState();
    const updatedSource = state.design.pages[state.design.activePageId].nodes[sourceId] as TVectorNode;

    expect(state.design.pages[state.design.activePageId].nodes[targetId]).toBeUndefined();
    expect(updatedSource.vertices).toHaveProperty('a');
    expect(state.design.vectorEditingNodeIds).toEqual([sourceId]);
  });

  it("should split the edge and connect onto the split point for an 'edge' hit", () => {
    // mock
    const nodeId = addVectorNodeWithEdge();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    store.dispatch(setPenActiveVertexId('a'));

    // before — split its own edge at t=0.5 while extending from the same node's other vertex
    applyContinueVectorNetworkHit(
      { kind: 'edge', segmentId: 'sb', t: 0.5 },
      { x: 500, y: 50 },
      node,
      'a',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      false,
    );

    // result
    const updatedNode = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const newVertexId = updatedNode.segments.sb.endId;

    expect(newVertexId).not.toBe('a');
    expect(newVertexId).not.toBe('b');
    expect(updatedNode.vertices[newVertexId]).toEqual({ id: newVertexId, x: 500, y: 50 });
    expect(store.getState().design.penActiveVertexId).toBeNull();
  });

  it("should split and merge into the given target node for a 'crossNodeEdge' hit", () => {
    // mock
    const sourceId = addVectorNode();
    const targetId = addVectorNodeWithEdge();

    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;
    const targetNode = store.getState().design.pages[store.getState().design.activePageId].nodes[targetId] as TVectorNode;

    // before
    applyContinueVectorNetworkHit(
      { kind: 'crossNodeEdge', segmentId: 'sb', t: 0.5, targetNode },
      { x: 500, y: 50 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      false,
    );

    // result
    const state = store.getState();
    const updatedSource = state.design.pages[state.design.activePageId].nodes[sourceId] as TVectorNode;
    const newVertexId = updatedSource.segments.sb.endId;

    expect(state.design.pages[state.design.activePageId].nodes[targetId]).toBeUndefined();
    expect(newVertexId).not.toBe('a');
    expect(newVertexId).not.toBe('b');
    expect(updatedSource.vertices[newVertexId]).toEqual({ id: newVertexId, x: 500, y: 50 });
    expect(state.design.vectorEditingNodeIds).toEqual([sourceId]);
  });

  it("should add a snapped new vertex and segment for an 'extend' hit", () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    // before — a couple of px off horizontal from v1(0,0), within the angle-snap tolerance
    applyContinueVectorNetworkHit(
      { kind: 'extend' },
      { x: 500, y: 5 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      false,
    );

    // result — pulled exactly onto v1's own y, not the raw clicked y
    const updatedNode = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const newVertexId = store.getState().design.penActiveVertexId as string;

    expect(newVertexId).not.toBeNull();
    expect(updatedNode.vertices[newVertexId].y).toBe(0);
  });
});
