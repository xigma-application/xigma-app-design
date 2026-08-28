// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { applyConnectedCutResults } from '../applyConnectedCutResults';
import { findVectorConnectedCutResult } from '../findVectorConnectedCutResult';

const addTriangleNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 50, y: 100 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('applyConnectedCutResults', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should dispatch nothing when there are no connected cut results', () => {
    // mock
    const nodeId = addTriangleNode();
    const nodeBefore = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId];

    // before
    applyConnectedCutResults(store.dispatch, []);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toEqual(nodeBefore);
  });

  it('should update the node with the materialized segments, vertices, and filledFaceKeys, resetting rotation to 0', () => {
    // mock
    const nodeId = addTriangleNode();
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;
    const connectedCutResult = findVectorConnectedCutResult(node, { x: 50, y: -10 }, { x: 50, y: 10 })!;

    // before
    applyConnectedCutResults(store.dispatch, [connectedCutResult]);

    // result
    const updated = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(Object.keys(updated.vertices)).toHaveLength(5);
    expect(Object.keys(updated.segments)).toHaveLength(4);
    expect(updated.rotation).toBe(0);
  });
});
