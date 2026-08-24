// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleSelectAll } from '../handleSelectAll';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handleSelectAll', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should select every node currently on the canvas', () => {
    // mock
    addFrameNode();
    addFrameNode();

    // action
    handleSelectAll(store.dispatch);

    // result
    expect(store.getState().design.selectedIds).toEqual(store.getState().design.rootOrder);
  });

  it('should do nothing while a vector node is open for editing', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setVectorEditingNodeIds([frameId]));

    // action
    handleSelectAll(store.dispatch);

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });
});
