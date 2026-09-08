// store
import { addNode, deleteNode, moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { dispatchSmartSelectionGapUpdates } from '../dispatchSmartSelectionGapUpdates';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

const addRect = (x: number, y: number, size = 50): string => {
  store.dispatch(
    addNode({ fill: '#000', height: size, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: size, x, y }),
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
      height: 400,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 400,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('dispatchSmartSelectionGapUpdates', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should cascade every group along the x axis, keeping the anchor fixed', () => {
    // mock — anchor at x0 width50, one group at x100
    const idB = addRect(100, 0);
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 50,
      axis: 'x',
      badgeAnchor: { x: 0, y: 0 },
      cascadeGroups: [{ nodeIds: [idB], originalPosition: 100, size: 50 }],
      currentGapValue: 50,
      dispatchThrottle: { frameId: null, run: null },
      gapIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idB]: { x: 100, y: 0 } },
      originalGapValue: 50,
      pointerStart: { x: 0, y: 0 },
    };

    // action — grow the gap from 50 to 80
    dispatchSmartSelectionGapUpdates(store.dispatch, dragState, 80);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — new left edge = anchor(0) + anchorSize(50) + newGap(80) = 130
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 130, y: 0 });
  });

  it('should cascade multiple groups in order along the y axis', () => {
    // mock — anchor at y0 height50, then two further groups
    const idB = addRect(0, 100);
    const idC = addRect(0, 200);
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 50,
      axis: 'y',
      badgeAnchor: { x: 0, y: 0 },
      cascadeGroups: [
        { nodeIds: [idB], originalPosition: 100, size: 50 },
        { nodeIds: [idC], originalPosition: 200, size: 50 },
      ],
      currentGapValue: 50,
      dispatchThrottle: { frameId: null, run: null },
      gapIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idB]: { x: 0, y: 100 }, [idC]: { x: 0, y: 200 } },
      originalGapValue: 50,
      pointerStart: { x: 0, y: 0 },
    };

    // action
    dispatchSmartSelectionGapUpdates(store.dispatch, dragState, 60);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — b: 0+50+60=110; c: 110+50+60=220
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 0, y: 110 });
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idC]).toMatchObject({ x: 0, y: 220 });
  });

  it('should reflow the auto-layout frame LIVE, on the same throttled flush, when the gap-drag members are children of a group nested in it', () => {
    // mock — a (anchor) and b live in a Group, itself a member of a horizontal auto-layout frame
    // alongside sibling c. Widening the a-b gap grows the group; the frame must react on the very
    // flush that moves b, not wait for pointer-up
    const frameId = addAutoLayoutFrame();
    const groupId = addGroup();
    const idA = addRect(0, 0, 20);
    const idB = addRect(30, 0, 20);
    const idC = addRect(0, 0, 20);

    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [idC], targetIndex: 1, targetParentId: frameId }));

    const cBefore = (selectActivePage(store.getState()).nodes[idC] as { x: number }).x;
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 20,
      axis: 'x',
      badgeAnchor: { x: 0, y: 0 },
      cascadeGroups: [{ nodeIds: [idB], originalPosition: 30, size: 20 }],
      currentGapValue: 10,
      dispatchThrottle: { frameId: null, run: null },
      gapIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idB]: { x: 30, y: 0 } },
      originalGapValue: 10,
      pointerStart: { x: 0, y: 0 },
    };

    // action — grow the a-b gap from 10 to 60, pushing b out to x = 0 + 20 + 60 = 80
    dispatchSmartSelectionGapUpdates(store.dispatch, dragState, 60);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — the group widened to 100 (a at 0-20, b at 80-100) and 'c' already slid over
    const page = selectActivePage(store.getState());
    expect(page.nodes[groupId]).toMatchObject({ width: 100 });
    expect((page.nodes[idC] as { x: number }).x).toBeGreaterThan(cBefore);
    expect(page.nodes[idC]).toMatchObject({ x: 100 });
  });

  it('should move every node in a cascade group together', () => {
    // mock — a grid column with 2 cells sharing one group
    const idB = addRect(100, 0);
    const idD = addRect(100, 100);
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 50,
      axis: 'x',
      badgeAnchor: { x: 0, y: 0 },
      cascadeGroups: [{ nodeIds: [idB, idD], originalPosition: 100, size: 50 }],
      currentGapValue: 50,
      dispatchThrottle: { frameId: null, run: null },
      gapIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idB]: { x: 100, y: 0 }, [idD]: { x: 100, y: 100 } },
      originalGapValue: 50,
      pointerStart: { x: 0, y: 0 },
    };

    // action
    dispatchSmartSelectionGapUpdates(store.dispatch, dragState, 70);
    flushThrottledDispatch(dragState.dispatchThrottle);

    // result — both move to the same new x (0+50+70=120), keeping their own y
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 120, y: 0 });
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idD]).toMatchObject({ x: 120, y: 100 });
  });
});
