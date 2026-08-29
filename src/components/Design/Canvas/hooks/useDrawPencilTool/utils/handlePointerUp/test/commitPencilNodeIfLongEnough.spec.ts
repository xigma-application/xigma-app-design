// store
import { setSelection } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitPencilNodeIfLongEnough } from '../commitPencilNodeIfLongEnough';

describe('commitPencilNodeIfLongEnough', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should not dispatch anything for a single point (nothing to connect)', () => {
    // mock
    const rootOrderBefore = store.getState().design.pages[store.getState().design.activePageId].rootOrder.length;

    // before
    commitPencilNodeIfLongEnough(store.dispatch, store, [{ x: 0, y: 0 }]);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].rootOrder).toHaveLength(rootOrderBefore);
  });

  it('should not dispatch anything when the path length is under MIN_SHAPE_SIZE', () => {
    // mock — total path length 0.5
    const rootOrderBefore = store.getState().design.pages[store.getState().design.activePageId].rootOrder.length;

    // before
    commitPencilNodeIfLongEnough(store.dispatch, store, [
      { x: 0, y: 0 },
      { x: 0, y: 0.5 },
    ]);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].rootOrder).toHaveLength(rootOrderBefore);
  });

  it('should commit a rounded-cap vector node and select it once the path clears the minimum size', () => {
    // before
    commitPencilNodeIfLongEnough(store.dispatch, store, [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());
    const selectedIds = selectSelectedIds(store.getState());
    const newNodeId = rootOrder[rootOrder.length - 1];
    const node = nodes[newNodeId] as TVectorNode;

    expect(node.type).toBe(NodeType.vector);
    expect(node.capStyle).toBe('round');
    expect(selectedIds).toEqual([newNodeId]);
  });
});
