// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleFlattenSelection } from '../handleFlattenSelection';

describe('handleFlattenSelection', () => {
  it('should do nothing when the selection has no node convertible to a vector', async () => {
    // mock
    store.dispatch(setSelection([]));

    // action
    await handleFlattenSelection(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([]);
  });

  it('should replace a convertible shape with its vector equivalent, keeping its id', async () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 0, y: 0 }),
    );
    const [rectId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([rectId]));

    // action
    await handleFlattenSelection(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[rectId].type).toBe(NodeType.vector);
    expect(page.nodes[rectId].id).toBe(rectId);
  });
});
