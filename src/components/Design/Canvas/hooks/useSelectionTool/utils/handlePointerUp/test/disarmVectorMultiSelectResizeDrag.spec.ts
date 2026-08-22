import { RefObject } from 'react';

// types
import { TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';

// utils
import { disarmVectorMultiSelectResizeDrag } from '../disarmVectorMultiSelectResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();
  canvas.style.cursor = 'url(some-resize-cursor) 16 16, auto';

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createVectorMultiSelectResizeDragRef = (
  value: TVectorMultiSelectResizeDragState | null = null,
): RefObject<TVectorMultiSelectResizeDragState | null> => ({ current: value });

const createVectorMultiSelectBoxRef = (value: TVectorMultiSelectBox | null = null): RefObject<TVectorMultiSelectBox | null> => ({
  current: value,
});

describe('disarmVectorMultiSelectResizeDrag', () => {
  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmVectorMultiSelectResizeDrag(canvas, pointerEvent(), createVectorMultiSelectResizeDragRef(), createVectorMultiSelectBoxRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the resize-drag ref, release pointer capture, and reset the cursor', () => {
    // mock — a stale rotated resize cursor from mid-drag must not stick around once released with no
    // further pointermove to re-evaluate it (the general "stale hover after drag ends" gotcha)
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectResizeDragRef({
      anchor: { x: 0, y: 0 },
      anchorWorld: { x: 0, y: 0 },
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      handleOrigins: {},
      liveBounds: { height: 200, width: 200, x: 0, y: 0 },
      rotation: 0,
      vertexOrigins: {},
    });
    const boxRef = createVectorMultiSelectBoxRef({ bounds: { height: 100, width: 100, x: 0, y: 0 }, rotation: 0, selectionKey: 'v1,v2' });

    // before
    disarmVectorMultiSelectResizeDrag(canvas, pointerEvent(2), dragRef, boxRef);

    // result
    expect(dragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(canvas.style.cursor).toBe('');
  });

  it('should persist the drag’s live (scaled) bounds onto the canonical box, keeping its rotation and selection key untouched', () => {
    // mock
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectResizeDragRef({
      anchor: { x: 0, y: 0 },
      anchorWorld: { x: 31.699, y: -18.301 },
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      handleOrigins: {},
      liveBounds: { height: 200, width: 200, x: 0, y: 0 },
      rotation: 30,
      vertexOrigins: {},
    });
    const boxRef = createVectorMultiSelectBoxRef({ bounds: { height: 100, width: 100, x: 0, y: 0 }, rotation: 30, selectionKey: 'v1,v2' });

    // before
    disarmVectorMultiSelectResizeDrag(canvas, pointerEvent(2), dragRef, boxRef);

    // result
    expect(boxRef.current).toEqual({ bounds: { height: 200, width: 200, x: 0, y: 0 }, rotation: 30, selectionKey: 'v1,v2' });
  });

  it('should leave the canonical box untouched when there was none to begin with', () => {
    // mock
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectResizeDragRef({
      anchor: { x: 0, y: 0 },
      anchorWorld: { x: 0, y: 0 },
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'se',
      handleOrigins: {},
      liveBounds: { height: 200, width: 200, x: 0, y: 0 },
      rotation: 0,
      vertexOrigins: {},
    });
    const boxRef = createVectorMultiSelectBoxRef(null);

    // before
    disarmVectorMultiSelectResizeDrag(canvas, pointerEvent(2), dragRef, boxRef);

    // result
    expect(boxRef.current).toBeNull();
  });
});
