// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { applyDivideResults } from '../applyDivideResults';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { findVectorDivideResult } from '../findVectorDivideResult';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const addSquareNode = (): string => {
  const segments = {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
  } as const;
  const vertices = {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
  };
  const [face] = deriveVectorFaces({
    fillColor: null,
    filledFaceKeys: [],
    id: 'probe',
    name: '',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  });

  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [getVectorFillLoopKey(face.pieceKeys)],
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

describe('applyDivideResults', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should return an empty array and dispatch nothing when there are no divide results', () => {
    // mock
    const rootOrderBefore = [...store.getState().design.rootOrder];

    // before
    const newNodeIds = applyDivideResults(store.dispatch, []);

    // result
    expect(newNodeIds).toEqual([]);
    expect(store.getState().design.rootOrder).toEqual(rootOrderBefore);
  });

  it('should commit every divide result and return one new node id per extra component, with fill preserved on both halves', () => {
    // mock
    const nodeId = addSquareNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const divideResult = findVectorDivideResult(node, { x: -20, y: 50 }, { x: 120, y: 50 })!;
    const rootOrderBefore = [...store.getState().design.rootOrder];

    // before
    const newNodeIds = applyDivideResults(store.dispatch, [divideResult]);

    // result
    expect(newNodeIds).toHaveLength(1);
    expect(store.getState().design.rootOrder.filter((id) => !rootOrderBefore.includes(id))).toEqual(newNodeIds);

    [nodeId, ...newNodeIds].forEach((id) => {
      const resultNode = store.getState().design.nodes[id] as TVectorNode;

      expect(resultNode.filledFaceKeys.length).toBeGreaterThan(0);
    });
  });
});
