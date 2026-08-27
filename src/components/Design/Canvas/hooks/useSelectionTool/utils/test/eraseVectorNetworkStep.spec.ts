// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { eraseVectorNetworkStep } from '../eraseVectorNetworkStep';

const addVectorNode = (rotation = 0): string => {
  store.dispatch(
    addNode({
      fillColor: '#000000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const currentNode = (id: string): TVectorNode => store.getState().design.nodes[id] as TVectorNode;

describe('eraseVectorNetworkStep', () => {
  afterEach(() => store.dispatch(setVectorEditingNodeIds([])));

  it('should commit a mid-segment gap for a brush that straddles the segment', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // action
    eraseVectorNetworkStep(store.dispatch, { x: 50, y: 0 }, { x: 50, y: 0 }, 15);

    // result — one edge became two stubs
    expect(Object.keys(currentNode(nodeId).segments)).toHaveLength(2);
  });

  it('should bake a rotated node down to rotation 0 as part of the erase', () => {
    // mock
    const nodeId = addVectorNode(45);
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // action
    eraseVectorNetworkStep(store.dispatch, { x: 0, y: 0 }, { x: 100, y: 0 }, 200);

    // result
    expect(currentNode(nodeId).rotation).toBe(0);
  });

  it('should leave the node untouched when the brush misses everything', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const before = currentNode(nodeId).segments;

    // action
    eraseVectorNetworkStep(store.dispatch, { x: 500, y: 500 }, { x: 500, y: 500 }, 5);

    // result
    expect(currentNode(nodeId).segments).toBe(before);
  });

  it('should skip a stale editing node id that no longer resolves to a vector node', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['stale-node-id']));

    // action / result — no throw
    expect(() => eraseVectorNetworkStep(store.dispatch, { x: 0, y: 0 }, { x: 10, y: 0 }, 5)).not.toThrow();
  });
});
