// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';

// utils
import { dispatchVectorMultiSelectResizeUpdates } from '../dispatchVectorMultiSelectResizeUpdates';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const dragState = (): TVectorMultiSelectResizeDragState => ({
  anchor: { x: 0, y: 0 },
  anchorWorld: { x: 0, y: 0 },
  bounds: { height: 100, width: 100, x: 0, y: 0 },
  handle: 'se',
  handleOrigins: { 'start:s1': { x: 5, y: 0 } },
  liveBounds: { height: 100, width: 100, x: 0, y: 0 },
  rotation: 0,
  vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 100 } },
});

describe('dispatchVectorMultiSelectResizeUpdates', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should scale the group’s vertices and handles relative to the anchor and dispatch the update', () => {
    // mock
    const id = addVectorNode();
    const state = dragState();
    const groups = { [id]: { handleKeys: Object.keys(state.handleOrigins), vertexIds: Object.keys(state.vertexOrigins) } };
    const nodes = selectActivePage(store.getState()).nodes;

    // before
    dispatchVectorMultiSelectResizeUpdates(store.dispatch, nodes, groups, state, { x: 0, y: 0 }, 0, state.anchor, 2, 2);

    // result
    const node = selectActivePage(store.getState()).nodes[id];

    expect(node).toMatchObject({
      segments: { s1: { tangentStart: { x: 10, y: 0 } } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 200, y: 200 } },
    });
  });

  it('should not dispatch anything when there are no groups to update', () => {
    // mock
    const state = dragState();

    // before & result — must not throw with an empty group set
    expect(() => {
      dispatchVectorMultiSelectResizeUpdates(store.dispatch, {}, {}, state, { x: 0, y: 0 }, 0, state.anchor, 2, 2);
    }).not.toThrow();
  });
});
