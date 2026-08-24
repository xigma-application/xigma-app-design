// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleCopySelection } from '../handleCopySelection';
import { handlePasteSelection } from '../handlePasteSelection';
import { setClipboardNodes } from '../clipboard';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 5, y: 5 }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handlePasteSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    setClipboardNodes([]);
  });

  it('should add an offset clone of every copied node and select the new clones', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    handleCopySelection();
    store.dispatch(setSelection([]));

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    const { nodes, selectedIds } = store.getState().design;

    expect(selectedIds).toHaveLength(1);
    expect(selectedIds).not.toEqual([frameId]);

    const pastedNode = nodes[selectedIds[0]];

    expect(pastedNode).toMatchObject({ x: 15, y: 15 });
  });

  it('should be undoable as a single step even though it dispatches multiple nodes', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    handleCopySelection();
    store.dispatch(setSelection([]));

    const nodeCountBeforePaste = Object.keys(store.getState().design.nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    expect(Object.keys(store.getState().design.nodes)).toHaveLength(nodeCountBeforePaste);
  });

  it('should do nothing when the clipboard is empty', () => {
    // mock
    const nodeCountBeforePaste = Object.keys(store.getState().design.nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.nodes)).toHaveLength(nodeCountBeforePaste);
  });

  it('should do nothing while a vector node is open for editing', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    handleCopySelection();
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    const nodeCountBeforePaste = Object.keys(store.getState().design.nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.nodes)).toHaveLength(nodeCountBeforePaste);
  });
});
