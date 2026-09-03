import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';

// types
import { NodeType } from 'types/design/enums';
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
});
