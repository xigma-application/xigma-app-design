import { RefObject } from 'react';

// types
import { TImageCropResizeDragState } from 'types/design/canvas/types';

// utils
import { disarmImageCropResizeDrag } from '../disarmImageCropResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createRef = (dragState: TImageCropResizeDragState | null = null): RefObject<TImageCropResizeDragState | null> => ({
  current: dragState,
});

const DRAG_STATE: TImageCropResizeDragState = {
  handle: 'se',
  nodeId: 'node-a',
  origin: { height: 40, rotation: 0, width: 40, x: 0, y: 0 },
  paintIndex: 0,
};

describe('disarmImageCropResizeDrag', () => {
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
    disarmImageCropResizeDrag(canvas, pointerEvent(), createRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release pointer capture immediately', () => {
    // mock
    const canvas = createCanvas();
    const imageCropResizeDragRef = createRef(DRAG_STATE);

    // before
    disarmImageCropResizeDrag(canvas, pointerEvent(2), imageCropResizeDragRef);

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should clear the drag ref only once the current tick finishes', () => {
    // mock
    const canvas = createCanvas();
    const imageCropResizeDragRef = createRef(DRAG_STATE);

    // before
    disarmImageCropResizeDrag(canvas, pointerEvent(2), imageCropResizeDragRef);

    // result
    expect(imageCropResizeDragRef.current).not.toBeNull();
    vi.runAllTimers();
    expect(imageCropResizeDragRef.current).toBeNull();
  });
});
