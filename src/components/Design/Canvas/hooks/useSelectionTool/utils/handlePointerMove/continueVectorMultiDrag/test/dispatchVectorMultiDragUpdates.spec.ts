// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

// utils
import { dispatchVectorMultiDragUpdates } from '../dispatchVectorMultiDragUpdates';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const dragState = (): TVectorMultiDragState => ({
  boxOrigin: null,
  dispatchThrottle: { frameId: null, run: null },
  handleOrigins: { 'end:s1': { x: -5, y: 0 }, 'start:s1': { x: 5, y: 0 } },
  hasMoved: false,
  pendingClickAction: null,
  pointerStart: { x: 0, y: 0 },
  vertexOrigins: { v2: { x: 100, y: 0 } },
});

describe('dispatchVectorMultiDragUpdates', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should translate the group’s vertices and handles by the delta and dispatch the update once the throttle flushes', () => {
    // mock
    const id = addVectorNode();
    const state = dragState();
    const groups = { [id]: { handleKeys: Object.keys(state.handleOrigins), vertexIds: Object.keys(state.vertexOrigins) } };
    const nodes = selectActivePage(store.getState()).nodes;

    // before
    dispatchVectorMultiDragUpdates(store.dispatch, nodes, groups, state, 10, 40);
    flushThrottledDispatch(state.dispatchThrottle);

    // result
    const node = selectActivePage(store.getState()).nodes[id];

    expect(node).toMatchObject({
      segments: { s1: { tangentEnd: { x: 5, y: 40 }, tangentStart: { x: 15, y: 40 } } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 110, y: 40 } },
    });
  });

  it('should not dispatch anything when there are no groups to update', () => {
    // mock
    const state = dragState();

    // before & result — must not throw with an empty group set
    expect(() => {
      dispatchVectorMultiDragUpdates(store.dispatch, {}, {}, state, 10, 40);
      flushThrottledDispatch(state.dispatchThrottle);
    }).not.toThrow();
  });
});
