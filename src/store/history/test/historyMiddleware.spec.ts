// store
import { addNode, setSelection, toggleNodeHidden, toggleNodeLocked } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture, redo, undo } from '../actions';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('historyMiddleware', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when there is nothing to redo', () => {
    // before
    const nodesBefore = store.getState().design.pages[store.getState().design.activePageId].nodes;

    // action
    store.dispatch(redo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toBe(nodesBefore);
  });

  it('should do nothing when there is nothing to undo', () => {
    // before
    const nodesBefore = store.getState().design.pages[store.getState().design.activePageId].nodes;

    // action
    store.dispatch(undo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toBe(nodesBefore);
  });

  it('should restore the undone snapshot when redo is dispatched', () => {
    // mock
    const idA = addFrameNode(0, 0);

    // before
    store.dispatch(undo());

    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toBeUndefined();

    // action
    store.dispatch(redo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toBeDefined();
  });

  it('should pair the gesture-start vector-selection payload with the pre-gesture design snapshot', () => {
    // before
    store.dispatch(beginHistoryGesture({ selectedVectorHandles: [], selectedVectorSegmentIds: [], selectedVectorVertexIds: ['v1'] }));

    const idA = addFrameNode(0, 0);

    store.dispatch(endHistoryGesture());

    // action
    const restored = store.dispatch(undo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toBeUndefined();
    expect(restored).toEqual({ selectedVectorHandles: [], selectedVectorSegmentIds: [], selectedVectorVertexIds: ['v1'] });
  });

  it('should treat a plain selection change as its own undo step, independent of any content change', () => {
    // mock — select a node, then deselect it; neither dispatch touches nodes/rootOrder at all
    const idA = addFrameNode(0, 0);

    store.dispatch(setSelection([idA]));
    store.dispatch(setSelection([]));

    // before
    expect(selectSelectedIds(store.getState())).toEqual([]);

    // action — undo should only step back through the deselect, restoring the selection, not the node
    store.dispatch(undo());

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toBeDefined();
  });

  it("should treat toggling a node's locked/hidden state as its own undo step", () => {
    // mock
    const idA = addFrameNode(0, 0);

    store.dispatch(toggleNodeLocked(idA));
    store.dispatch(toggleNodeHidden(idA));

    // before
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA].hidden).toBe(true);

    // action — undo should only step back through the hidden toggle
    store.dispatch(undo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA].hidden).toBeUndefined();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA].locked).toBe(true);
  });
});
