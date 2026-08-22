// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deleteSelectedSegments } from '../deleteSelectedSegments';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 }, v3: { id: 'v3', x: 20, y: 20 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('deleteSelectedSegments', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should dispatch one updateNode per owning node, dropping the selected segment and the endpoint it leaves with no segment left', () => {
    // mock — deleting s1 (v1 -> v2) drops v1, which loses its only segment; v2 stays held by s2
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    // before
    deleteSelectedSegments(store.dispatch, [node], ['s1']);

    // result
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(updated.segments)).toEqual(['s2']);
    expect(Object.keys(updated.vertices)).toEqual(['v2', 'v3']);
  });
});
