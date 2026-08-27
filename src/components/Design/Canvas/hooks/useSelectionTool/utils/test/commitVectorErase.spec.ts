// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitVectorErase } from '../commitVectorErase';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

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

const addFilledRectNode = (color: string): string => {
  const segments = {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
  };
  const vertices = {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 40, y: 0 },
    c: { id: 'c', x: 40, y: 40 },
    d: { id: 'd', x: 0, y: 40 },
  };
  const key = getVectorFillLoopKey(
    deriveVectorFaces({
      fillColor: null,
      filledFaceKeys: [],
      id: 'probe',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    })[0].pieceKeys,
  );

  store.dispatch(
    addNode({
      fillColor: null,
      fillColorOverrideByKey: { [key]: color },
      filledFaceKeys: [key],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const currentNode = (id: string): TVectorNode => store.getState().design.nodes[id] as TVectorNode;

describe('commitVectorErase', () => {
  afterEach(() => store.dispatch(setVectorEditingNodeIds([])));

  it("should keep the face's own picked color after a carve that leaves the face filled, instead of a hash-derived one", () => {
    // mock
    const nodeId = addFilledRectNode('#ff0000');
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // action — a shallow dip into the top edge, well short of the far side, so the face survives
    commitVectorErase(
      store.dispatch,
      [
        { x: 20, y: -4.13 },
        { x: 20, y: 15.13 },
      ],
      3,
    );

    // result
    const node = currentNode(nodeId);

    expect(node.filledFaceKeys).toHaveLength(1);
    expect(node.fillColorOverrideByKey?.[node.filledFaceKeys[0]]).toBe('#ff0000');
  });

  it('should commit a mid-segment gap for a single-point (click) stroke that straddles the segment', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // action
    commitVectorErase(store.dispatch, [{ x: 50, y: 0 }], 15);

    // result — one edge became two stubs
    expect(Object.keys(currentNode(nodeId).segments)).toHaveLength(2);
  });

  it('should sweep a multi-point stroke, erasing everything the brush passed over', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // action — a stroke running the length of the segment
    commitVectorErase(
      store.dispatch,
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
      ],
      20,
    );

    // result — the whole segment is gone
    expect(currentNode(nodeId).segments).toEqual({});
  });

  it('should bake a rotated node down to rotation 0 as part of the erase', () => {
    // mock
    const nodeId = addVectorNode(45);
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // action
    commitVectorErase(
      store.dispatch,
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      200,
    );

    // result
    expect(currentNode(nodeId).rotation).toBe(0);
  });

  it('should leave the node untouched when the stroke misses everything', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const before = currentNode(nodeId).segments;

    // action
    commitVectorErase(
      store.dispatch,
      [
        { x: 500, y: 500 },
        { x: 520, y: 500 },
      ],
      5,
    );

    // result
    expect(currentNode(nodeId).segments).toBe(before);
  });

  it('should skip a stale editing node id that no longer resolves to a vector node', () => {
    // mock
    store.dispatch(setVectorEditingNodeIds(['stale-node-id']));

    // action / result — no throw
    expect(() => commitVectorErase(store.dispatch, [{ x: 0, y: 0 }], 5)).not.toThrow();
  });
});
