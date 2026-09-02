// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { handleEscapePenActiveVertex } from '../handleEscapePenActiveVertex';

const addVectorNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): string => {
  store.dispatch(
    addNode({
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleEscapePenActiveVertex', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should just clear the active pen vertex when there is no node currently in Vector Edit Mode', () => {
    // mock
    store.dispatch(setPenActiveVertexId('vertex-1'));

    // before
    handleEscapePenActiveVertex(store.dispatch);

    // result
    expect(store.getState().design.penActiveVertexId).toBeNull();
  });

  it('should delete the whole node when the active vertex is its only, still-unconnected vertex', () => {
    // mock
    const vectorId = addVectorNode({}, { v1: { id: 'v1', x: 0, y: 0 } });

    store.dispatch(setVectorEditingNodeIds([vectorId]));
    store.dispatch(setPenActiveVertexId('v1'));

    // before
    handleEscapePenActiveVertex(store.dispatch);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId]).toBeUndefined();
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(store.getState().design.penActiveVertexId).toBeNull();
  });

  it('should remove only the dangling vertex when the node already has other segments', () => {
    // mock
    const vectorId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 50, y: 50 } },
    );

    store.dispatch(setVectorEditingNodeIds([vectorId]));
    store.dispatch(setPenActiveVertexId('v3'));

    // before
    handleEscapePenActiveVertex(store.dispatch);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId]).toMatchObject({
      vertices: { v1: { id: 'v1' }, v2: { id: 'v2' } },
    });
    expect(store.getState().design.vectorEditingNodeIds).toEqual([vectorId]);
    expect(store.getState().design.penActiveVertexId).toBeNull();
  });

  it('should keep the active vertex intact when it is already connected by a segment', () => {
    // mock
    const vectorId = addVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    );

    store.dispatch(setVectorEditingNodeIds([vectorId]));
    store.dispatch(setPenActiveVertexId('v2'));

    // before
    handleEscapePenActiveVertex(store.dispatch);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId]).toMatchObject({
      vertices: { v1: { id: 'v1' }, v2: { id: 'v2' } },
    });
    expect(store.getState().design.penActiveVertexId).toBeNull();
  });
});
