// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectSelectedIds, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleUseSelectionAsMask } from '../handleUseSelectionAsMask';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleUseSelectionAsMask', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should wrap the current selection into a mask group', () => {
    // mock
    const idA = addFrameNode();
    const idB = addFrameNode();

    store.dispatch(setSelection([idA, idB]));

    // action
    handleUseSelectionAsMask(store.dispatch);

    // result
    const [selectedId] = selectSelectedIds(store.getState());
    const group = selectSelectedNodes(store.getState())[0];
    expect(group.type).toBe(NodeType.group);
    expect(group.name).toBe('Mask group');
    expect(selectedId).not.toBe(idA);
  });

  it('should do nothing while in vector editing mode', () => {
    // mock
    const idA = addFrameNode();
    const idB = addFrameNode();

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(setVectorEditingNodeIds(['whatever']));

    // action
    handleUseSelectionAsMask(store.dispatch);

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB]);

    store.dispatch(setVectorEditingNodeIds([]));
  });
});
