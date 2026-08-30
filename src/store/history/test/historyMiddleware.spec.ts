// store
import {
  addNode,
  addPage,
  groupNodes,
  moveNodes,
  reorderPages,
  setSelection,
  toggleNodeHidden,
  toggleNodeLocked,
  ungroupNodes,
} from 'store/design/slice';
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

  it('should treat a node move as its own undo step', () => {
    // mock
    const idA = addFrameNode(0, 0);
    addFrameNode(50, 50);
    const orderAfterAdd = selectActivePage(store.getState()).rootOrder;

    // before
    store.dispatch(moveNodes({ nodeIds: [idA], targetIndex: orderAfterAdd.length, targetParentId: null }));

    expect(selectActivePage(store.getState()).rootOrder).not.toEqual(orderAfterAdd);

    // action — undo should only step back through the move
    store.dispatch(undo());

    // result
    expect(selectActivePage(store.getState()).rootOrder).toEqual(orderAfterAdd);
  });

  it('should treat grouping and ungrouping as their own undo steps', () => {
    // mock
    const idA = addFrameNode(0, 0);
    const idB = addFrameNode(50, 50);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());

    const groupId = selectSelectedIds(store.getState())[0];

    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[groupId].type).toBe(NodeType.group);

    store.dispatch(ungroupNodes([groupId]));

    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[groupId]).toBeUndefined();

    // action — undo the ungroup only
    store.dispatch(undo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[groupId].type).toBe(NodeType.group);

    // action — undo the group too
    store.dispatch(undo());

    // result
    const page = store.getState().design.pages[store.getState().design.activePageId];
    expect(page.nodes[groupId]).toBeUndefined();
    expect(page.nodes[idA].parentId).toBeNull();
    expect(page.nodes[idB].parentId).toBeNull();
    expect(page.rootOrder).toContain(idA);
    expect(page.rootOrder).toContain(idB);
  });

  it('should treat a page reorder as its own undo step', () => {
    // mock
    store.dispatch(addPage());
    const newPageId = store.getState().design.activePageId;
    const pagesAfterAdd = Object.keys(store.getState().design.pages);

    // before
    store.dispatch(reorderPages({ fromIndex: pagesAfterAdd.indexOf(newPageId), toIndex: 0 }));

    expect(Object.keys(store.getState().design.pages)[0]).toBe(newPageId);

    // action — undo should only step back through the reorder, not the addPage
    store.dispatch(undo());

    // result
    expect(Object.keys(store.getState().design.pages)).toEqual(pagesAfterAdd);
  });
});
