import { RefObject } from 'react';

// types
import { TImageCropMoveDragState } from 'types/design/canvas/types';

// utils
import { disarmImageCropMoveDrag } from '../disarmImageCropMoveDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createRef = (dragState: TImageCropMoveDragState | null = null): RefObject<TImageCropMoveDragState | null> => ({
  current: dragState,
});

const DRAG_STATE: TImageCropMoveDragState = {
  nodeId: 'node-a',
  origin: { height: 40, rotation: 0, width: 40, x: 0, y: 0 },
  paintIndex: 0,
  startPoint: { x: 0, y: 0 },
};

describe('disarmImageCropMoveDrag', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should do nothing when no drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmImageCropMoveDrag(canvas, pointerEvent(), createRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release pointer capture immediately', () => {
    // mock
    const canvas = createCanvas();
    const imageCropMoveDragRef = createRef(DRAG_STATE);

    // before
    disarmImageCropMoveDrag(canvas, pointerEvent(2), imageCropMoveDragRef);

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should clear the drag ref only once the current tick finishes', () => {
    // mock
    const canvas = createCanvas();
    const imageCropMoveDragRef = createRef(DRAG_STATE);

    // before
    disarmImageCropMoveDrag(canvas, pointerEvent(2), imageCropMoveDragRef);

    // result
    expect(imageCropMoveDragRef.current).not.toBeNull();
    vi.runAllTimers();
    expect(imageCropMoveDragRef.current).toBeNull();
  });
});
