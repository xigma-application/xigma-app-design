import { RefObject } from 'react';

// store
import { store } from 'store';

// types
import { TPenDragOrigin } from '../../../types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerCancel } from '../handlePointerCancel';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (): PointerEvent => new PointerEvent('pointercancel', { pointerId: 1 });

const createDragOriginRef = (value: TPenDragOrigin | null): RefObject<TPenDragOrigin | null> => ({ current: value });
const createDragStartRef = (value: TPoint | null): RefObject<TPoint | null> => ({ current: value });

describe('handlePointerCancel', () => {
  it('should clear the drag refs and release the pointer capture regardless of which button triggered the cancel', () => {
    // mock
    const canvas = createCanvas();
    const dragOriginRef = createDragOriginRef({ nodeId: 'n', segmentId: null, vertexId: 'v' });
    const dragStartRef = createDragStartRef({ x: 1, y: 1 });

    // before
    handlePointerCancel(canvas, pointerEvent(), store.dispatch, dragOriginRef, dragStartRef);

    // result
    expect(dragOriginRef.current).toBeNull();
    expect(dragStartRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
  });
});
