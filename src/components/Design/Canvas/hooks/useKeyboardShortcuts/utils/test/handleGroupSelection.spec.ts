// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectSelectedIds, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleGroupSelection } from '../handleGroupSelection';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleGroupSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should group the current selection into a single group node', () => {
    // mock
    const idA = addFrameNode();
    const idB = addFrameNode();

    store.dispatch(setSelection([idA, idB]));

    // action
    handleGroupSelection(store.dispatch);

    // result
    const [selectedId] = selectSelectedIds(store.getState());
    expect(selectSelectedNodes(store.getState())[0].type).toBe(NodeType.group);
    expect(selectedId).not.toBe(idA);
  });

  it('should do nothing while in vector editing mode', () => {
    // mock
    const idA = addFrameNode();
    const idB = addFrameNode();

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(setVectorEditingNodeIds(['whatever']));

    // action
    handleGroupSelection(store.dispatch);

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB]);

    store.dispatch(setVectorEditingNodeIds([]));
  });
});
