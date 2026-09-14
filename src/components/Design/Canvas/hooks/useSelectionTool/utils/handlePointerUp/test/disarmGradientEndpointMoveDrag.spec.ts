import { RefObject } from 'react';

// types
import { TGradientEndpointMoveDragState } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { disarmGradientEndpointMoveDrag } from '../disarmGradientEndpointMoveDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createGradientEndpointMoveDragRef = (
  dragState: TGradientEndpointMoveDragState | null = null,
): RefObject<TGradientEndpointMoveDragState | null> => ({ current: dragState });

const DRAG_STATE: TGradientEndpointMoveDragState = { endpoint: 'start', nodeId: 'node-a', paintIndex: 0 };

describe('disarmGradientEndpointMoveDrag', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should do nothing when no gradient endpoint move drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmGradientEndpointMoveDrag(canvas, pointerEvent(), createGradientEndpointMoveDragRef(), createCanvasRefs());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release pointer capture immediately', () => {
    // mock
    const canvas = createCanvas();
    const gradientEndpointMoveDragRef = createGradientEndpointMoveDragRef(DRAG_STATE);

    // before
    disarmGradientEndpointMoveDrag(canvas, pointerEvent(2), gradientEndpointMoveDragRef, createCanvasRefs());

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should clear the alignment guide immediately', () => {
    // mock
    const canvas = createCanvas();
    const gradientEndpointMoveDragRef = createGradientEndpointMoveDragRef(DRAG_STATE);
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.alignmentGuideRef.current = { horizontal: null, vertical: null };

    // before
    disarmGradientEndpointMoveDrag(canvas, pointerEvent(2), gradientEndpointMoveDragRef, canvasRefs);

    // result
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
  });

  it('should keep the drag ref set through the current tick, so a deferred outside-click check still sees it', () => {
    // mock
    const canvas = createCanvas();
    const gradientEndpointMoveDragRef = createGradientEndpointMoveDragRef(DRAG_STATE);

    // before
    disarmGradientEndpointMoveDrag(canvas, pointerEvent(2), gradientEndpointMoveDragRef, createCanvasRefs());

    // result — still set right after the call returns
    expect(gradientEndpointMoveDragRef.current).not.toBeNull();
  });

  it('should clear the drag ref once the current tick finishes', () => {
    // mock
    const canvas = createCanvas();
    const gradientEndpointMoveDragRef = createGradientEndpointMoveDragRef(DRAG_STATE);

    // before
    disarmGradientEndpointMoveDrag(canvas, pointerEvent(2), gradientEndpointMoveDragRef, createCanvasRefs());
    vi.runAllTimers();

    // result
    expect(gradientEndpointMoveDragRef.current).toBeNull();
  });
});
