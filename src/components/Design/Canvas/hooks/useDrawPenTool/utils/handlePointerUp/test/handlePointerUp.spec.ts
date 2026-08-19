import { RefObject } from 'react';

// store
import { store } from 'store';

// types
import { TPenDragOrigin } from '../../../types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerUp } from '../handlePointerUp';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerup', { button: 0, pointerId: 1, ...options });

const createDragOriginRef = (value: TPenDragOrigin | null): RefObject<TPenDragOrigin | null> => ({ current: value });
const createDragStartRef = (value: TPoint | null): RefObject<TPoint | null> => ({ current: value });

describe('handlePointerUp', () => {
  it('should clear the drag refs and release the pointer capture on a primary-button release', () => {
    // mock
    const canvas = createCanvas();
    const dragOriginRef = createDragOriginRef({ nodeId: 'n', segmentId: null, vertexId: 'v' });
    const dragStartRef = createDragStartRef({ x: 1, y: 1 });

    // before
    handlePointerUp(canvas, pointerEvent(), store.dispatch, dragOriginRef, dragStartRef);

    // result
    expect(dragOriginRef.current).toBeNull();
    expect(dragStartRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('should leave an in-progress drag untouched when a non-primary button is released', () => {
    // mock
    const canvas = createCanvas();
    const dragOriginRef = createDragOriginRef({ nodeId: 'n', segmentId: null, vertexId: 'v' });
    const dragStartRef = createDragStartRef({ x: 1, y: 1 });

    // before
    handlePointerUp(canvas, pointerEvent({ button: 1 }), store.dispatch, dragOriginRef, dragStartRef);

    // result
    expect(dragOriginRef.current).toEqual({ nodeId: 'n', segmentId: null, vertexId: 'v' });
    expect(dragStartRef.current).toEqual({ x: 1, y: 1 });
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });
});
