// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deleteDanglingActiveVertex } from '../deleteDanglingActiveVertex';

const addVectorNode = (
  segments: TVectorNode['segments'],
  vertices: TVectorNode['vertices'],
  vertexHandleModes: TVectorNode['vertexHandleModes'] = {},
): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes,
      vertices,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('deleteDanglingActiveVertex', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should only clear the active pen vertex, leaving the node untouched, when that vertex is connected to a segment', () => {
    // mock
    const vectorId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([vectorId]));
    store.dispatch(setPenActiveVertexId('v2'));

    const node = store.getState().design.nodes[vectorId] as TVectorNode;

    // before
    deleteDanglingActiveVertex(store.dispatch, node, 'v2');

    // result
    expect(store.getState().design.penActiveVertexId).toBeNull();
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorId]);
    expect(store.getState().design.nodes[vectorId]).toMatchObject({
      segments: { s1: { endId: 'v2', startId: 'v1' } },
      vertices: { v1: { id: 'v1' }, v2: { id: 'v2' } },
    });
  });

  it('should delete the whole node and exit vector edit mode when the dangling vertex is its only vertex', () => {
    // mock
    const vectorId = addVectorNode({}, { v1: { id: 'v1', x: 0, y: 0 } });

    store.dispatch(setVectorEditingNodeIds([vectorId]));
    store.dispatch(setPenActiveVertexId('v1'));

    const node = store.getState().design.nodes[vectorId] as TVectorNode;

    // before
    deleteDanglingActiveVertex(store.dispatch, node, 'v1');

    // result
    expect(store.getState().design.nodes[vectorId]).toBeUndefined();
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(store.getState().design.penActiveVertexId).toBeNull();
  });

  it('should remove only the dangling vertex (and its handle mode), keeping the rest of the node intact', () => {
    // mock
    const vectorId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 50, y: 50 } },
      { v3: 'smooth' },
    );

    store.dispatch(setVectorEditingNodeIds([vectorId]));
    store.dispatch(setPenActiveVertexId('v3'));

    const node = store.getState().design.nodes[vectorId] as TVectorNode;

    // before
    deleteDanglingActiveVertex(store.dispatch, node, 'v3');

    // result
    const updatedNode = store.getState().design.nodes[vectorId] as TVectorNode;

    expect(updatedNode.vertices).toEqual({ v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } });
    expect(updatedNode.vertexHandleModes).toEqual({});
    expect(updatedNode.segments).toEqual({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } });
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorId]);
    expect(store.getState().design.penActiveVertexId).toBeNull();
  });
});
