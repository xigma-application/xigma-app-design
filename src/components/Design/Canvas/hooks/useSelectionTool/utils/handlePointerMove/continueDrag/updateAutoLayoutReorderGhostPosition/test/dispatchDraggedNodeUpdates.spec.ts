// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { dispatchDraggedNodeUpdates } from '../dispatchDraggedNodeUpdates';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 20, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const dragState = (nodeOrigins: TDragState['nodeOrigins']): TDragState =>
  ({ dispatchThrottle: { frameId: null, run: null }, nodeOrigins }) as unknown as TDragState;

describe('dispatchDraggedNodeUpdates', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should dispatch the delta onto every non-snapshotted dragged node once the frame flushes', () => {
    // mock
    const id = addRect(100, 100);
    const state = dragState({ [id]: { x: 100, y: 100 } });

    // action
    dispatchDraggedNodeUpdates(store.dispatch, state, null, 10, 20);
    flushThrottledDispatch(state.dispatchThrottle);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[id]).toMatchObject({ x: 110, y: 120 });
  });

  it('should skip a node whose live preview comes from a snapshot', () => {
    // mock
    const id = addRect(100, 100);
    const state = dragState({ [id]: { x: 100, y: 100 } });
    const snapshots = new Map<string, TVectorNodeDragSnapshot>([
      [id, { deltaX: 0, deltaY: 0, facesByPaint: [], strokeColor: '#000', strokeVertices: [] }],
    ]);

    // action
    dispatchDraggedNodeUpdates(store.dispatch, state, snapshots, 10, 20);
    flushThrottledDispatch(state.dispatchThrottle);

    // result — unchanged
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[id]).toMatchObject({ x: 100, y: 100 });
  });
});
