// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { resolveContinueVectorNetworkHit } from '../resolveContinueVectorNetworkHit';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

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

const addVectorNodeWithEdge = (vertices: { a: { x: number; y: number }; b: { x: number; y: number } }): string => {
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
      vertices: { a: { id: 'a', x: vertices.a.x, y: vertices.a.y }, b: { id: 'b', x: vertices.b.x, y: vertices.b.y } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('resolveContinueVectorNetworkHit', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId(null));
  });

  it("should resolve a 'vertex' hit when clicking near another vertex on the same node", () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    // before
    const hit = resolveContinueVectorNetworkHit({ x: 100, y: 100 }, node, 'v1', IDENTITY_VIEWPORT, store);

    // result
    expect(hit).toEqual({ kind: 'vertex', vertexId: 'v2' });
  });

  it("should resolve a 'crossNodeVertex' hit, carrying the resolved target node, when clicking near a vertex on another open node", () => {
    // mock — node A being extended, node B open at the same time with a vertex right at the click point
    const sourceId = addVectorNode();
    const targetId = addVectorNodeWithEdge({ a: { x: 500, y: 500 }, b: { x: 700, y: 700 } });

    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;

    // before
    const hit = resolveContinueVectorNetworkHit({ x: 500, y: 500 }, node, 'v1', IDENTITY_VIEWPORT, store);

    // result
    const targetNode = store.getState().design.pages[store.getState().design.activePageId].nodes[targetId];

    expect(hit).toEqual({ kind: 'crossNodeVertex', targetNode, vertexId: 'a' });
  });

  it("should resolve an 'edge' hit when clicking on an existing segment of the same node", () => {
    // mock
    const nodeId = addVectorNodeWithEdge({ a: { x: 200, y: 0 }, b: { x: 300, y: 0 } });
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

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
        vertices: { v1: { id: 'v1', x: 0, y: 0 } },
      }),
    );

    // before — click the midpoint of the a-b edge, extending from v1(0,0) on the same node
    const hit = resolveContinueVectorNetworkHit({ x: 250, y: 0 }, node, 'a', IDENTITY_VIEWPORT, store);

    // result
    expect(hit).toEqual({ kind: 'edge', segmentId: 'sb', t: 0.5 });
  });

  it("should resolve a 'crossNodeEdge' hit, carrying the resolved target node, when clicking on an edge of another open node", () => {
    // mock — node A being extended, node B open at the same time with an edge whose midpoint is the click point
    const sourceId = addVectorNode();
    const targetId = addVectorNodeWithEdge({ a: { x: 500, y: 0 }, b: { x: 500, y: 100 } });

    store.dispatch(setVectorEditingNodeIds([sourceId, targetId]));

    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[sourceId] as TVectorNode;

    // before
    const hit = resolveContinueVectorNetworkHit({ x: 500, y: 50 }, node, 'v1', IDENTITY_VIEWPORT, store);

    // result
    const targetNode = store.getState().design.pages[store.getState().design.activePageId].nodes[targetId];

    expect(hit).toEqual({ kind: 'crossNodeEdge', segmentId: 'sb', t: 0.5, targetNode });
  });

  it("should resolve an 'extend' hit when the click misses every vertex/edge on every open node", () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    // before
    const hit = resolveContinueVectorNetworkHit({ x: 5000, y: 5000 }, node, 'v1', IDENTITY_VIEWPORT, store);

    // result
    expect(hit).toEqual({ kind: 'extend' });
  });
});
