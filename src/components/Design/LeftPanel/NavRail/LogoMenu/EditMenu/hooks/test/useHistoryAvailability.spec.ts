import { act, renderHook } from '@testing-library/react';

// hooks
import { useHistoryAvailability } from '../useHistoryAvailability';

// store
import { addNode, deleteNode } from 'store/design/slice';
import { undo } from 'store/history/actions';
import { selectActivePage } from 'store/design/selectors';
import { historyStack, store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const drainHistory = (): void => {
  while (historyStack.canUndo()) {
    store.dispatch(undo());
  }

  selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));

  while (historyStack.canUndo()) {
    store.dispatch(undo());
  }
};

describe('useHistoryAvailability', () => {
  it('should report both flags as false once the history stack is empty', () => {
    // before
    drainHistory();

    // action
    const { result } = renderHook(() => useHistoryAvailability());

    // result
    expect(result.current).toEqual({ canRedo: false, canUndo: false });
  });

  it('should flip canUndo to true and stay reactive as the stack changes', () => {
    // before
    drainHistory();

    const { result } = renderHook(() => useHistoryAvailability());

    expect(result.current.canUndo).toBe(false);

    // action — an undoable dispatch outside the hook's own render should still be picked up
    act(() => {
      store.dispatch(
        addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 20, x: 0, y: 0 }),
      );
    });

    // result
    expect(result.current).toEqual({ canRedo: false, canUndo: true });

    // action
    act(() => {
      store.dispatch(undo());
    });

    // result
    expect(result.current).toEqual({ canRedo: true, canUndo: false });
  });
});
