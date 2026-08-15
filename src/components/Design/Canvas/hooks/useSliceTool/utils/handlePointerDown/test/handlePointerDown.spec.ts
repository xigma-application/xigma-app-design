import { RefObject } from 'react';

// store
import { setActiveTool, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TSliceDraft, TSliceDrawDragState, TSliceMoveDragState, TSliceResizeDragState, TSliceRotateDragState } from '../../../types';

// utils
import { handlePointerDown } from '../handlePointerDown';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

const createRefs = (
  slice: TSliceDraft | null,
): {
  drawDragRef: RefObject<TSliceDrawDragState | null>;
  moveDragRef: RefObject<TSliceMoveDragState | null>;
  resizeDragRef: RefObject<TSliceResizeDragState | null>;
  rotateDragRef: RefObject<TSliceRotateDragState | null>;
  sliceRef: RefObject<TSliceDraft | null>;
} => ({
  drawDragRef: { current: null },
  moveDragRef: { current: null },
  resizeDragRef: { current: null },
  rotateDragRef: { current: null },
  sliceRef: { current: slice },
});

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.slice));
    store.dispatch(setSelection(['a']));
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const canvas = createCanvas();
    const refs = createRefs(null);

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, { button: 1 }),
      store.dispatch,
      refs.sliceRef,
      refs.drawDragRef,
      refs.resizeDragRef,
      refs.rotateDragRef,
      refs.moveDragRef,
    );

    // result
    expect(refs.drawDragRef.current).toBeNull();
  });

  it('should clear the selection and arm a draw drag when no slice exists yet', () => {
    // mock
    const canvas = createCanvas();
    const refs = createRefs(null);

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      refs.sliceRef,
      refs.drawDragRef,
      refs.resizeDragRef,
      refs.rotateDragRef,
      refs.moveDragRef,
    );

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(refs.drawDragRef.current).toEqual({ start: { x: 10, y: 10 } });
  });

  it('should arm a resize drag when the pointer is on a resize handle', () => {
    // mock
    const canvas = createCanvas();
    const refs = createRefs({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    // before
    handlePointerDown(
      canvas,
      pointerEvent(100, 100),
      store.dispatch,
      refs.sliceRef,
      refs.drawDragRef,
      refs.resizeDragRef,
      refs.rotateDragRef,
      refs.moveDragRef,
    );

    // result
    expect(refs.resizeDragRef.current).toEqual({ bounds: refs.sliceRef.current, handle: 'se' });
  });

  it('should arm a rotate drag when the pointer is just outside a corner handle', () => {
    // mock
    const canvas = createCanvas();
    const refs = createRefs({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    // before
    handlePointerDown(
      canvas,
      pointerEvent(0, -10),
      store.dispatch,
      refs.sliceRef,
      refs.drawDragRef,
      refs.resizeDragRef,
      refs.rotateDragRef,
      refs.moveDragRef,
    );

    // result
    expect(refs.rotateDragRef.current).not.toBeNull();
  });

  it('should arm a move drag when the pointer is inside the slice body', () => {
    // mock
    const canvas = createCanvas();
    const refs = createRefs({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    // before
    handlePointerDown(
      canvas,
      pointerEvent(50, 50),
      store.dispatch,
      refs.sliceRef,
      refs.drawDragRef,
      refs.resizeDragRef,
      refs.rotateDragRef,
      refs.moveDragRef,
    );

    // result
    expect(refs.moveDragRef.current).toEqual({ origin: refs.sliceRef.current, pointerStart: { x: 50, y: 50 } });
  });

  it('should discard the slice and revert to the default tool when clicking outside it', () => {
    // mock
    const canvas = createCanvas();
    const refs = createRefs({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    // before
    handlePointerDown(
      canvas,
      pointerEvent(900, 900),
      store.dispatch,
      refs.sliceRef,
      refs.drawDragRef,
      refs.resizeDragRef,
      refs.rotateDragRef,
      refs.moveDragRef,
    );

    // result
    expect(refs.sliceRef.current).toBeNull();
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});
