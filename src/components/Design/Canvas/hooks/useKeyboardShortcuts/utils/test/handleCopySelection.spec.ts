// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getClipboardNodes, setClipboardNodes } from '../clipboard';
import { handleCopySelection } from '../handleCopySelection';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handleCopySelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    setClipboardNodes([]);
  });

  it('should copy the selected nodes into the clipboard', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // action
    handleCopySelection();

    // result
    expect(getClipboardNodes().map((node) => node.id)).toEqual([frameId]);
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    addFrameNode();

    // action
    handleCopySelection();

    // result
    expect(getClipboardNodes()).toEqual([]);
  });

  it('should do nothing while a vector node is open for editing', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    // action
    handleCopySelection();

    // result
    expect(getClipboardNodes()).toEqual([]);
  });
});
