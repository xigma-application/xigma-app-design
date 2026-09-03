// store
import { addNode, groupNodes, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleUngroupSelection } from '../handleUngroupSelection';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const groupTwoFrames = (): { childIds: string[]; groupId: string } => {
  const idA = addFrameNode();
  const idB = addFrameNode();

  store.dispatch(setSelection([idA, idB]));
  store.dispatch(groupNodes());

  return { childIds: [idA, idB], groupId: selectSelectedIds(store.getState())[0] };
};

describe('handleUngroupSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should ungroup every selected group node and select the released children', () => {
    // mock
    const { childIds } = groupTwoFrames();

    // action
    handleUngroupSelection(store.dispatch);

    // result
    expect(selectSelectedIds(store.getState())).toEqual(childIds);
  });

  it('should do nothing when the selection contains no group', () => {
    // mock
    const idA = addFrameNode();

    store.dispatch(setSelection([idA]));

    // action
    handleUngroupSelection(store.dispatch);

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
  });

  it('should do nothing while in vector editing mode', () => {
    // mock
    const { groupId } = groupTwoFrames();

    store.dispatch(setVectorEditingNodeIds(['whatever']));

    // action
    handleUngroupSelection(store.dispatch);

    // result
    expect(selectSelectedIds(store.getState())).toEqual([groupId]);

    store.dispatch(setVectorEditingNodeIds([]));
  });
});
