// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { duplicateOwningNodeFragments } from '../duplicateOwningNodeFragments';

const addVectorNode = (idSuffix: string): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        [`s${idSuffix}`]: { endId: `v2${idSuffix}`, id: `s${idSuffix}`, startId: `v1${idSuffix}`, tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        [`v1${idSuffix}`]: { id: `v1${idSuffix}`, x: 0, y: 0 },
        [`v2${idSuffix}`]: { id: `v2${idSuffix}`, x: 10, y: 0 },
      },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('duplicateOwningNodeFragments', () => {
  it('should duplicate a single owning node’s fragment, dispatching its merged changes and returning the new ids', () => {
    // mock
    const nodeId = addVectorNode('A');
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const owningNodesById = new Map([[nodeId, node]]);

    // before
    const result = duplicateOwningNodeFragments(store.dispatch, owningNodesById, [], ['sA']);

    // result
    const updatedNode = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(Object.keys(updatedNode.segments)).toHaveLength(2);
    expect(result.newSegmentIds).toHaveLength(1);
    expect(result.newVertexIds).toHaveLength(2);
  });

  it('should duplicate every owning node and concatenate their new ids together, not just the last one', () => {
    // mock — two independent vector nodes, each contributing its own duplicated segment
    const nodeAId = addVectorNode('B');
    const nodeBId = addVectorNode('C');
    const owningNodesById = new Map([
      [nodeAId, store.getState().design.pages[store.getState().design.activePageId].nodes[nodeAId] as TVectorNode],
      [nodeBId, store.getState().design.pages[store.getState().design.activePageId].nodes[nodeBId] as TVectorNode],
    ]);

    // before
    const result = duplicateOwningNodeFragments(store.dispatch, owningNodesById, [], ['sB', 'sC']);

    // result — one new segment id from each of the two nodes
    expect(result.newSegmentIds).toHaveLength(2);
    expect(result.newVertexIds).toHaveLength(4);

    const updatedNodeA = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeAId] as TVectorNode;
    const updatedNodeB = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeBId] as TVectorNode;

    expect(Object.keys(updatedNodeA.segments)).toHaveLength(2);
    expect(Object.keys(updatedNodeB.segments)).toHaveLength(2);
  });

  it('should return empty id arrays when there are no owning nodes to duplicate', () => {
    // before
    const result = duplicateOwningNodeFragments(store.dispatch, new Map(), [], []);

    // result
    expect(result).toEqual({ newSegmentIds: [], newVertexIds: [] });
  });
});
