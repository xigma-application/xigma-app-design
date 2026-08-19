// store
import { addNode, setSelection } from 'store/design/slice';
import { redo, undo } from '../actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('historyMiddleware', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when there is nothing to redo', () => {
    // before
    const nodesBefore = store.getState().design.nodes;

    // action
    store.dispatch(redo());

    // result
    expect(store.getState().design.nodes).toBe(nodesBefore);
  });

  it('should do nothing when there is nothing to undo', () => {
    // before
    const nodesBefore = store.getState().design.nodes;

    // action
    store.dispatch(undo());

    // result
    expect(store.getState().design.nodes).toBe(nodesBefore);
  });

  it('should restore the undone snapshot when redo is dispatched', () => {
    // mock
    const idA = addFrameNode(0, 0);

    // before
    store.dispatch(undo());

    expect(store.getState().design.nodes[idA]).toBeUndefined();

    // action
    store.dispatch(redo());

    // result
    expect(store.getState().design.nodes[idA]).toBeDefined();
  });
});
