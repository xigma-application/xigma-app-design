import { RefObject } from 'react';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { store } from 'store';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { disarmDrag } from '../disarmDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createDragStateRef = (dragState: TDragState | null = null): RefObject<TDragState | null> => ({ current: dragState });

const addFrameNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: size,
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

const addRectNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#00ff00', height: size, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addAutoLayoutFrameNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
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

const addGroupNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ childIds: [], height: size, name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const movedDragState = (): TDragState => ({
  candidateShapes: [],
  ctrlMarqueeFallback: null,
  dispatchThrottle: { frameId: null, run: null },
  hasMoved: true,
  nodeOrigins: {},
  pendingClickAction: null,
  pointerStart: { x: 0, y: 0 },
});

describe('disarmDrag', () => {
  const setClassName = vi.fn();

  beforeEach(() => {
    store.dispatch(setSelection([]));
    setClassName.mockClear();
  });

  it('should do nothing when no drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmDrag(canvas, pointerEvent(), store.dispatch, createDragStateRef(), createCanvasRefs(), setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should collapse the selection to a single node on an unmoved collapse click', () => {
    // mock
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      candidateShapes: [],
      ctrlMarqueeFallback: null,
      dispatchThrottle: { frameId: null, run: null },
      hasMoved: false,
      nodeOrigins: {},
      pendingClickAction: { id: 'a', kind: 'collapse' },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    disarmDrag(canvas, pointerEvent(1), store.dispatch, dragStateRef, createCanvasRefs(), setClassName);

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['a']);
    expect(dragStateRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should clear the selection on an unmoved deselect click', () => {
    // mock
    store.dispatch(setSelection(['a']));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      candidateShapes: [],
      ctrlMarqueeFallback: null,
      dispatchThrottle: { frameId: null, run: null },
      hasMoved: false,
      nodeOrigins: {},
      pendingClickAction: { kind: 'deselect' },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    disarmDrag(canvas, pointerEvent(), store.dispatch, dragStateRef, createCanvasRefs(), setClassName);

    // result
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it('should leave the selection untouched once the pointer has actually moved', () => {
    // mock
    store.dispatch(setSelection(['a', 'b']));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      candidateShapes: [],
      ctrlMarqueeFallback: null,
      dispatchThrottle: { frameId: null, run: null },
      hasMoved: true,
      nodeOrigins: {},
      pendingClickAction: { id: 'a', kind: 'collapse' },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    disarmDrag(canvas, pointerEvent(), store.dispatch, dragStateRef, createCanvasRefs(), setClassName);

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['a', 'b']);
    expect(dragStateRef.current).toBeNull();
  });

  it('should reparent the dragged selection into the drop-target frame and clear the ref', () => {
    // mock
    const frameId = addFrameNode(0, 0);
    const rectId = addRectNode(500, 500);

    store.dispatch(setSelection([rectId]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef(movedDragState());
    const canvasRefs = createCanvasRefs({ transform: { dropTargetFrameIdRef: { current: frameId } } });

    // before
    disarmDrag(canvas, pointerEvent(), store.dispatch, dragStateRef, canvasRefs, setClassName);

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[rectId].parentId).toBe(frameId);
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([rectId]);
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBeNull();
  });

  it('should reflow the auto-layout frame’s other members once a plain drag finishes repositioning a child inside a nested group', () => {
    // mock — a and b live inside a Group, which is itself a member of a horizontal auto-layout frame
    // alongside sibling 'c'. A plain (non-rotated, non-gap-handle) drag of 'b' within the group widens
    // the group; once the drag ends, the frame must react and slide 'c' over
    const frameId = addAutoLayoutFrameNode(0, 0);
    const groupId = addGroupNode(0, 0);
    const idA = addRectNode(0, 0);
    const idB = addRectNode(60, 0);
    const idC = addRectNode(0, 0);

    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [idC], targetIndex: 1, targetParentId: frameId }));

    // simulate the live per-frame position dispatch a plain drag already applied to 'b' before
    // pointer-up — its own updateNode already resynced the group's own box during the drag
    store.dispatch(updateNode({ changes: { x: 100 }, id: idB }));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({ ...movedDragState(), nodeOrigins: { [idB]: { x: 60, y: 0 } } });

    // before
    disarmDrag(canvas, pointerEvent(), store.dispatch, dragStateRef, createCanvasRefs(), setClassName);

    // result — the group widened to enclose a (0-20) + b's new position (100-120), and 'c' slid
    // over to sit right after it
    const page = selectActivePage(store.getState());
    expect(page.nodes[groupId]).toMatchObject({ width: 120 });
    expect(page.nodes[idC]).toMatchObject({ x: 120 });
  });
});
