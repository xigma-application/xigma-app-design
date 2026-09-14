import { RefObject } from 'react';

// types
import { TGradientRotateDragState } from 'types/design/canvas/types';

// utils
import { disarmGradientRotateDrag } from '../disarmGradientRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createGradientRotateDragRef = (
  dragState: TGradientRotateDragState | null = null,
): RefObject<TGradientRotateDragState | null> => ({ current: dragState });

describe('disarmGradientRotateDrag', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should do nothing when no gradient rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmGradientRotateDrag(canvas, pointerEvent(), createGradientRotateDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release pointer capture immediately', () => {
    // mock
    const canvas = createCanvas();
    const gradientRotateDragRef = createGradientRotateDragRef({
      draggedEndpoint: 'start',
      nodeId: 'node-a',
      paintIndex: 0,
      pointerPosition: { x: 0, y: 0 },
    });

    // before
    disarmGradientRotateDrag(canvas, pointerEvent(2), gradientRotateDragRef);

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should keep the drag ref set through the current tick, so a deferred outside-click check still sees it', () => {
    // mock — Radix's Popover defers its outside-interaction check to the native "click" event that
    // follows pointerup; clearing the ref synchronously here would make that check see no drag at all
    const canvas = createCanvas();
    const gradientRotateDragRef = createGradientRotateDragRef({
      draggedEndpoint: 'start',
      nodeId: 'node-a',
      paintIndex: 0,
      pointerPosition: { x: 0, y: 0 },
    });

    // before
    disarmGradientRotateDrag(canvas, pointerEvent(2), gradientRotateDragRef);

    // result — still set right after the call returns
    expect(gradientRotateDragRef.current).not.toBeNull();
  });

  it('should clear the drag ref once the current tick finishes', () => {
    // mock
    const canvas = createCanvas();
    const gradientRotateDragRef = createGradientRotateDragRef({
      draggedEndpoint: 'start',
      nodeId: 'node-a',
      paintIndex: 0,
      pointerPosition: { x: 0, y: 0 },
    });

    // before
    disarmGradientRotateDrag(canvas, pointerEvent(2), gradientRotateDragRef);
    vi.runAllTimers();

    // result
    expect(gradientRotateDragRef.current).toBeNull();
  });
});
