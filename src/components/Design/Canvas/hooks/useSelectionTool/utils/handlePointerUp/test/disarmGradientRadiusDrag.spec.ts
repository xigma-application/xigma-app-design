import { RefObject } from 'react';

// types
import { TGradientRadiusDragState } from 'types/design/canvas/types';

// utils
import { disarmGradientRadiusDrag } from '../disarmGradientRadiusDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createGradientRadiusDragRef = (dragState: TGradientRadiusDragState | null = null): RefObject<TGradientRadiusDragState | null> => ({
  current: dragState,
});

const DRAG_STATE: TGradientRadiusDragState = { nodeId: 'node-a', paintIndex: 0 };

describe('disarmGradientRadiusDrag', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should do nothing when no gradient radius drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmGradientRadiusDrag(canvas, pointerEvent(), createGradientRadiusDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release pointer capture immediately', () => {
    // mock
    const canvas = createCanvas();
    const gradientRadiusDragRef = createGradientRadiusDragRef(DRAG_STATE);

    // before
    disarmGradientRadiusDrag(canvas, pointerEvent(2), gradientRadiusDragRef);

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should keep the drag ref set through the current tick, so a deferred outside-click check still sees it', () => {
    // mock
    const canvas = createCanvas();
    const gradientRadiusDragRef = createGradientRadiusDragRef(DRAG_STATE);

    // before
    disarmGradientRadiusDrag(canvas, pointerEvent(2), gradientRadiusDragRef);

    // result — still set right after the call returns
    expect(gradientRadiusDragRef.current).not.toBeNull();
  });

  it('should clear the drag ref once the current tick finishes', () => {
    // mock
    const canvas = createCanvas();
    const gradientRadiusDragRef = createGradientRadiusDragRef(DRAG_STATE);

    // before
    disarmGradientRadiusDrag(canvas, pointerEvent(2), gradientRadiusDragRef);
    vi.runAllTimers();

    // result
    expect(gradientRadiusDragRef.current).toBeNull();
  });
});
