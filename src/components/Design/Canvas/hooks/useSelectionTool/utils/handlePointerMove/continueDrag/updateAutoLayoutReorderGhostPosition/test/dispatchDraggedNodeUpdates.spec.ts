// store
import { addNode, deleteNode, moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
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

const addGroup = (): string => {
  store.dispatch(
    addNode({ childIds: [], height: 20, name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addAutoLayoutFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: 200,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 300,
      x: 0,
      y: 0,
    }),
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

  it('should reflow the auto-layout frame LIVE, on this very flush, when the dragged node is a child of a group nested in it', () => {
    // mock — a and b live in a Group, which is a member of a horizontal auto-layout frame alongside
    // sibling c. Dragging b (a stays anchored) widens the group; the frame must react on the same
    // throttled flush that applies b's position, not wait for pointer-up
    const frameId = addAutoLayoutFrame();
    const groupId = addGroup();
    const idA = addRect(0, 0);
    const idB = addRect(30, 0);
    const idC = addRect(0, 0);

    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [idC], targetIndex: 1, targetParentId: frameId }));

    const cBefore = (selectActivePage(store.getState()).nodes[idC] as { x: number }).x;
    const state = dragState({ [idB]: { x: 30, y: 0 } });

    // action — drag b out by +50, one throttled flush
    dispatchDraggedNodeUpdates(store.dispatch, state, null, 50, 0);
    flushThrottledDispatch(state.dispatchThrottle);

    // result — the group widened and 'c' already slid over on this same flush
    const page = selectActivePage(store.getState());
    expect(page.nodes[groupId]).toMatchObject({ width: 100 });
    expect((page.nodes[idC] as { x: number }).x).toBeGreaterThan(cBefore);
    expect(page.nodes[idC]).toMatchObject({ x: 100 });
  });

  it('should NOT reflow the auto-layout frame when every one of the group’s children is dragged — a rigid move of the whole group’s content', () => {
    // mock — same shape, but both a and b are dragged together; the group's own shape is unchanged,
    // so the frame must be left alone rather than snapping the group back into its slot
    const frameId = addAutoLayoutFrame();
    const groupId = addGroup();
    const idA = addRect(0, 0);
    const idB = addRect(20, 0);
    const idC = addRect(0, 0);

    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [idC], targetIndex: 1, targetParentId: frameId }));

    const cBefore = (selectActivePage(store.getState()).nodes[idC] as { x: number }).x;
    const state = dragState({ [idA]: { x: 0, y: 0 }, [idB]: { x: 20, y: 0 } });

    // action
    dispatchDraggedNodeUpdates(store.dispatch, state, null, 400, 0);
    flushThrottledDispatch(state.dispatchThrottle);

    // result — 'c' untouched
    expect((selectActivePage(store.getState()).nodes[idC] as { x: number }).x).toBe(cBefore);
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
