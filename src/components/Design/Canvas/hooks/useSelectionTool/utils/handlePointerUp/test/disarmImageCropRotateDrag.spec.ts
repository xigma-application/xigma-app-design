import { RefObject } from 'react';

// types
import { TImageCropRotateDragState } from 'types/design/canvas/types';

// utils
import { disarmImageCropRotateDrag } from '../disarmImageCropRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createRef = (dragState: TImageCropRotateDragState | null = null): RefObject<TImageCropRotateDragState | null> => ({
  current: dragState,
});

const DRAG_STATE: TImageCropRotateDragState = {
  nodeId: 'node-a',
  origin: { height: 40, rotation: 0, width: 40, x: 0, y: 0 },
  paintIndex: 0,
  pivot: { x: 20, y: 20 },
  startAngle: 0,
};

describe('disarmImageCropRotateDrag', () => {
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
    disarmImageCropRotateDrag(canvas, pointerEvent(), createRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release pointer capture immediately', () => {
    // mock
    const canvas = createCanvas();
    const imageCropRotateDragRef = createRef(DRAG_STATE);

    // before
    disarmImageCropRotateDrag(canvas, pointerEvent(2), imageCropRotateDragRef);

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should clear the drag ref only once the current tick finishes', () => {
    // mock
    const canvas = createCanvas();
    const imageCropRotateDragRef = createRef(DRAG_STATE);

    // before
    disarmImageCropRotateDrag(canvas, pointerEvent(2), imageCropRotateDragRef);

    // result
    expect(imageCropRotateDragRef.current).not.toBeNull();
    vi.runAllTimers();
    expect(imageCropRotateDragRef.current).toBeNull();
  });
});
