// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { dispatchAsOneGestureIfMultiNode } from '../dispatchAsOneGestureIfMultiNode';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 10, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('dispatchAsOneGestureIfMultiNode', () => {
  it('should run the callback with no gesture wrapping when only one node is affected, leaving its dispatches as separate undo steps', () => {
    // mock — two deletes inside run(), but owningNodeCount is 1
    const idA = addFrameNode();
    const idB = addFrameNode();

    // before
    dispatchAsOneGestureIfMultiNode(store.dispatch, 1, () => {
      store.dispatch(deleteNode(idA));
      store.dispatch(deleteNode(idB));
    });
    store.dispatch(undo());

    // result — a single undo only reverses the LAST delete (idB), proving the two were never wrapped together
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toBeUndefined();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toBeDefined();
  });

  it('should wrap the callback in a single history gesture when more than one node is affected, so one undo reverses every dispatch inside it', () => {
    // mock — same two deletes inside run(), but owningNodeCount is 2
    const idA = addFrameNode();
    const idB = addFrameNode();

    // before
    dispatchAsOneGestureIfMultiNode(store.dispatch, 2, () => {
      store.dispatch(deleteNode(idA));
      store.dispatch(deleteNode(idB));
    });
    store.dispatch(undo());

    // result — a single undo restores both
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toBeDefined();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toBeDefined();
  });
});
