import { RefObject } from 'react';

// store
import { addNode, deleteNode, moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { disarmSmartSelectionGapDrag } from '../disarmSmartSelectionGapDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 50, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 50, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addGroup = (x: number, y: number): string => {
  store.dispatch(addNode({ childIds: [], height: 20, name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: 20, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addAutoLayoutFrame = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: size,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('disarmSmartSelectionGapDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should do nothing when no gap drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const gapDragRef: RefObject<TSmartSelectionGapDragState | null> = { current: null };

    // before
    disarmSmartSelectionGapDrag(canvas, pointerEvent(), store.dispatch, gapDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should flush any pending throttled dispatch, clear the ref and release pointer capture', () => {
    // mock — a pending run that has not fired yet (no requestAnimationFrame flush in this test env)
    const idB = addRect(100, 0);
    const canvas = createCanvas();
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 50,
      axis: 'x',
      badgeAnchor: { x: 75, y: 25 },
      cascadeGroups: [{ nodeIds: [idB], originalPosition: 100, size: 50 }],
      currentGapValue: 50,
      dispatchThrottle: {
        frameId: 1,
        run: (): void => {
          store.dispatch({ payload: { changes: { x: 999 }, id: idB }, type: 'design/updateNode' });
        },
      },
      gapIndex: 0,
      hasMoved: true,
      nodeOrigins: { [idB]: { x: 100, y: 0 } },
      originalGapValue: 50,
      pointerStart: { x: 75, y: 25 },
    };
    const gapDragRef: RefObject<TSmartSelectionGapDragState | null> = { current: dragState };

    // before
    disarmSmartSelectionGapDrag(canvas, pointerEvent(2), store.dispatch, gapDragRef);

    // result — the pending run fired synchronously on flush
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 999 });
    expect(gapDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should reflow the auto-layout frame’s other members once a gap drag finishes widening a nested group', () => {
    // mock — a and b live inside a Group, which is itself a member of a horizontal auto-layout frame
    // alongside sibling 'c'. Spreading a and b apart (a smart-guide gap drag) widens the group; once
    // the drag ends, the frame must react and slide 'c' over, not just leave it frozen in place
    const frameId = addAutoLayoutFrame(0, 0, 200);
    const groupId = addGroup(0, 0);
    const idA = addRect(0, 0);
    const idB = addRect(60, 0);
    const idC = addRect(0, 0);

    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [idC], targetIndex: 1, targetParentId: frameId }));

    // simulate the gap drag having already pushed b further out (its own updateNode dispatch — same
    // as applySmartSelectionGapCascade — already resynced the group's own box live during the drag)
    store.dispatch({ payload: { changes: { x: 100 }, id: idB }, type: 'design/updateNode' });

    const canvas = createCanvas();
    const dragState: TSmartSelectionGapDragState = {
      anchorPosition: 0,
      anchorSize: 20,
      axis: 'x',
      badgeAnchor: { x: 0, y: 0 },
      cascadeGroups: [{ nodeIds: [idB], originalPosition: 60, size: 20 }],
      currentGapValue: 80,
      dispatchThrottle: { frameId: null, run: (): void => {} },
      gapIndex: 0,
      hasMoved: true,
      // matches armSmartSelectionGapDrag's real shape — nodeOrigins only covers the moving
      // cascade members (b), never the fixed anchor (a)
      nodeOrigins: { [idB]: { x: 60, y: 0 } },
      originalGapValue: 40,
      pointerStart: { x: 0, y: 0 },
    };
    const gapDragRef: RefObject<TSmartSelectionGapDragState | null> = { current: dragState };

    // before
    disarmSmartSelectionGapDrag(canvas, pointerEvent(3), store.dispatch, gapDragRef);

    // result — the group widened to enclose a (0-50) + b's new position (100-150), and 'c' slid
    // over to sit right after it
    const page = selectActivePage(store.getState());
    expect(page.nodes[groupId]).toMatchObject({ width: 150 });
    expect(page.nodes[idC]).toMatchObject({ x: 150 });
  });
});
