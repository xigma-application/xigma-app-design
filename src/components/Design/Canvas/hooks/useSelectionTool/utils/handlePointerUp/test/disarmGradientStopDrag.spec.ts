import { RefObject } from 'react';

// types
import { TGradientStopDragState } from 'types/design/canvas/types';

// utils
import { disarmGradientStopDrag } from '../disarmGradientStopDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createGradientStopDragRef = (dragState: TGradientStopDragState | null = null): RefObject<TGradientStopDragState | null> => ({
  current: dragState,
});

describe('disarmGradientStopDrag', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should do nothing when no gradient stop drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmGradientStopDrag(canvas, pointerEvent(), createGradientStopDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release pointer capture immediately', () => {
    // mock
    const canvas = createCanvas();
    const gradientStopDragRef = createGradientStopDragRef({
      color: '#000000',
      draggedStopIndex: 0,
      nodeId: 'node-a',
      opacity: 100,
      paintIndex: 0,
    });

    // before
    disarmGradientStopDrag(canvas, pointerEvent(2), gradientStopDragRef);

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should keep the drag ref set through the current tick, so a deferred outside-click check still sees it', () => {
    // mock — Radix's Popover defers its outside-interaction check to the native "click" event that
    // follows pointerup; clearing the ref synchronously here would make that check see no drag at all
    const canvas = createCanvas();
    const gradientStopDragRef = createGradientStopDragRef({
      color: '#000000',
      draggedStopIndex: 0,
      nodeId: 'node-a',
      opacity: 100,
      paintIndex: 0,
    });

    // before
    disarmGradientStopDrag(canvas, pointerEvent(2), gradientStopDragRef);

    // result — still set right after the call returns
    expect(gradientStopDragRef.current).not.toBeNull();
  });

  it('should clear the drag ref once the current tick finishes', () => {
    // mock
    const canvas = createCanvas();
    const gradientStopDragRef = createGradientStopDragRef({
      color: '#000000',
      draggedStopIndex: 0,
      nodeId: 'node-a',
      opacity: 100,
      paintIndex: 0,
    });

    // before
    disarmGradientStopDrag(canvas, pointerEvent(2), gradientStopDragRef);
    vi.runAllTimers();

    // result
    expect(gradientStopDragRef.current).toBeNull();
  });
});
