import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

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
    disarmImageCropMoveDrag(canvas, pointerEvent(), createRef(), createCanvasRefs());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release pointer capture immediately', () => {
    // mock
    const canvas = createCanvas();
    const imageCropMoveDragRef = createRef(DRAG_STATE);

    // before
    disarmImageCropMoveDrag(canvas, pointerEvent(2), imageCropMoveDragRef, createCanvasRefs());

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should clear the drag ref only once the current tick finishes', () => {
    // mock
    const canvas = createCanvas();
    const imageCropMoveDragRef = createRef(DRAG_STATE);

    // before
    disarmImageCropMoveDrag(canvas, pointerEvent(2), imageCropMoveDragRef, createCanvasRefs());

    // result
    expect(imageCropMoveDragRef.current).not.toBeNull();
    vi.runAllTimers();
    expect(imageCropMoveDragRef.current).toBeNull();
  });

  it('should clear a leftover alignment guide immediately when the drag ends', () => {
    // mock
    const canvas = createCanvas();
    const imageCropMoveDragRef = createRef(DRAG_STATE);
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.alignmentGuideRef.current = {
      horizontal: null,
      vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 100 } },
    };

    // before
    disarmImageCropMoveDrag(canvas, pointerEvent(2), imageCropMoveDragRef, canvasRefs);

    // result
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
  });

  it('should leave the alignment guide untouched when no drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const guide = { horizontal: null, vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 100 } } };

    canvasRefs.transform.alignmentGuideRef.current = guide;

    // before
    disarmImageCropMoveDrag(canvas, pointerEvent(), createRef(), canvasRefs);

    // result
    expect(canvasRefs.transform.alignmentGuideRef.current).toBe(guide);
  });
});
