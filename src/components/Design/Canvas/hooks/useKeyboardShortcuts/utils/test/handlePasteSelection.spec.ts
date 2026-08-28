// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleCopySelection } from '../handleCopySelection';
import { handlePasteSelection } from '../handlePasteSelection';
import { setClipboardNodes } from '../clipboard';
import { setVectorClipboardFragment } from '../vectorClipboard';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 5, y: 5 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

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

describe('handlePasteSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    setClipboardNodes([]);
    setVectorClipboardFragment({ filledFacePieceKeySets: [], segments: [], vertexHandleModes: {}, vertices: [] });
  });

  it('should add an offset clone of every copied node and select the new clones', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    handleCopySelection(createCanvasRefs());
    store.dispatch(setSelection([]));

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    const { nodes } = selectActivePage(store.getState());
    const { selectedIds } = store.getState().design;

    expect(selectedIds).toHaveLength(1);
    expect(selectedIds).not.toEqual([frameId]);

    const pastedNode = nodes[selectedIds[0]];

    expect(pastedNode).toMatchObject({ x: 15, y: 15 });
  });

  it('should be undoable as a single step even though it dispatches multiple nodes', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    handleCopySelection(createCanvasRefs());
    store.dispatch(setSelection([]));

    const nodeCountBeforePaste = Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    expect(Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes)).toHaveLength(nodeCountBeforePaste);
  });

  it('should do nothing when the clipboard is empty', () => {
    // mock
    const nodeCountBeforePaste = Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes)).toHaveLength(nodeCountBeforePaste);
  });

  it('should do nothing while a vector node is open for editing and only a whole-node clipboard was copied', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    handleCopySelection(createCanvasRefs());
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    const nodeCountBeforePaste = Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes)).toHaveLength(nodeCountBeforePaste);
  });

  it('should paste a copied vector fragment into the open vector node', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const copyRefs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } });

    handleCopySelection(copyRefs);

    const pasteRefs = createCanvasRefs();

    // action
    handlePasteSelection(store.dispatch, pasteRefs);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId] as any;

    expect(Object.keys(node.vertices)).toHaveLength(2);
    expect(pasteRefs.vectorEdit.selectedVectorVertexIdsRef.current).toHaveLength(1);
  });
});
