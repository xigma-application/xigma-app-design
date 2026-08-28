// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { pasteVectorFragment } from '../pasteVectorFragment';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('pasteVectorFragment', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should merge the clipboard fragment into the last currently-open vector node and select the new vertex', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs();
    const fragment = { filledFacePieceKeySets: [], segments: [], vertexHandleModes: {}, vertices: [{ id: 'copied', x: 5, y: 5 }] };

    // action
    pasteVectorFragment(
      store.dispatch,
      refs,
      store.getState().design.pages[store.getState().design.activePageId].nodes,
      [vectorId],
      fragment,
    );

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId] as any;

    expect(Object.keys(node.vertices)).toHaveLength(2);
    expect(refs.vectorEdit.selectedVectorVertexIdsRef.current).toHaveLength(1);
    expect(refs.vectorEdit.selectedVectorVertexIdsRef.current[0]).not.toBe('copied');
  });

  it('should be undoable as a single step', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs();
    const fragment = { filledFacePieceKeySets: [], segments: [], vertexHandleModes: {}, vertices: [{ id: 'copied', x: 5, y: 5 }] };

    // action
    pasteVectorFragment(
      store.dispatch,
      refs,
      store.getState().design.pages[store.getState().design.activePageId].nodes,
      [vectorId],
      fragment,
    );
    store.dispatch(undo());

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId] as any;

    expect(Object.keys(node.vertices)).toHaveLength(1);
  });
});
