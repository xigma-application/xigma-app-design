// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleSendToBack } from '../handleSendToBack';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleSendToBack', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should move the selected node to the start of rootOrder', () => {
    // mock
    const idA = addFrameNode();
    const idB = addFrameNode();

    store.dispatch(setSelection([idB]));

    // action
    handleSendToBack(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).rootOrder).toEqual([idB, idA]);
  });

  it('should do nothing while in vector editing mode', () => {
    // mock
    const idA = addFrameNode();
    const idB = addFrameNode();
    const orderBefore = selectActivePage(store.getState()).rootOrder;

    store.dispatch(setSelection([idB]));
    store.dispatch(setVectorEditingNodeIds(['whatever']));

    // action
    handleSendToBack(store.dispatch);

    // result — the whole order is untouched, not just idA/idB's relative positions
    expect(selectActivePage(store.getState()).rootOrder).toEqual(orderBefore);
    expect(orderBefore.indexOf(idA)).toBeLessThan(orderBefore.indexOf(idB));

    store.dispatch(setVectorEditingNodeIds([]));
  });
});
