import { RefObject } from 'react';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TSliceDraft, TSliceDrawDragState } from '../../../types';

// utils
import { DEFAULT_CURSOR } from 'utils/canvas/defaultCursor';
import { disarmDrawDrag } from '../disarmDrawDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('disarmDrawDrag', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.slice));
  });

  it('should do nothing when no draw drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: null };

    // before
    disarmDrawDrag(canvas, pointerEvent(), store.dispatch, sliceRef, drawDragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should keep the slice and show the default cursor when the drawn box meets the minimum size', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: { height: 20, rotation: 0, width: 20, x: 0, y: 0 } };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: { start: { x: 0, y: 0 } } };

    // before
    disarmDrawDrag(canvas, pointerEvent(3), store.dispatch, sliceRef, drawDragRef);

    // result
    expect(sliceRef.current).not.toBeNull();
    expect(store.getState().design.activeTool).toBe(ToolName.slice);
    expect(canvas.style.cursor).toBe(DEFAULT_CURSOR);
    expect(drawDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(3);
  });

  it('should discard the slice and revert to the default tool when the drawn box is too small', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: { height: 1, rotation: 0, width: 1, x: 0, y: 0 } };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: { start: { x: 0, y: 0 } } };

    // before
    disarmDrawDrag(canvas, pointerEvent(4), store.dispatch, sliceRef, drawDragRef);

    // result
    expect(sliceRef.current).toBeNull();
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should discard when no box was ever written to the slice ref', () => {
    // mock
    const canvas = createCanvas();
    const sliceRef: RefObject<TSliceDraft | null> = { current: null };
    const drawDragRef: RefObject<TSliceDrawDragState | null> = { current: { start: { x: 0, y: 0 } } };

    // before
    disarmDrawDrag(canvas, pointerEvent(5), store.dispatch, sliceRef, drawDragRef);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});
