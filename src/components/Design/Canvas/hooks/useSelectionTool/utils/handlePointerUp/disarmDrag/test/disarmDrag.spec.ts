import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';

// types
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

describe('disarmDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmDrag(canvas, pointerEvent(), store.dispatch, createDragStateRef(), createCanvasRefs());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should collapse the selection to a single node on an unmoved collapse click', () => {
    // mock
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      dispatchThrottle: { frameId: null, run: null },
      hasMoved: false,
      nodeOrigins: {},
      pendingClickAction: { id: 'a', kind: 'collapse' },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    disarmDrag(canvas, pointerEvent(1), store.dispatch, dragStateRef, createCanvasRefs());

    // result
    expect(store.getState().design.selectedIds).toEqual(['a']);
    expect(dragStateRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('should clear the selection on an unmoved deselect click', () => {
    // mock
    store.dispatch(setSelection(['a']));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      dispatchThrottle: { frameId: null, run: null },
      hasMoved: false,
      nodeOrigins: {},
      pendingClickAction: { kind: 'deselect' },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    disarmDrag(canvas, pointerEvent(), store.dispatch, dragStateRef, createCanvasRefs());

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should leave the selection untouched once the pointer has actually moved', () => {
    // mock
    store.dispatch(setSelection(['a', 'b']));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      dispatchThrottle: { frameId: null, run: null },
      hasMoved: true,
      nodeOrigins: {},
      pendingClickAction: { id: 'a', kind: 'collapse' },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    disarmDrag(canvas, pointerEvent(), store.dispatch, dragStateRef, createCanvasRefs());

    // result
    expect(store.getState().design.selectedIds).toEqual(['a', 'b']);
    expect(dragStateRef.current).toBeNull();
  });
});
