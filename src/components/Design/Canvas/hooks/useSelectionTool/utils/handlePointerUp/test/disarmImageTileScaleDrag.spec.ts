import { RefObject } from 'react';

// types
import { TImageTileScaleDragState } from 'types/design/canvas/types';

// utils
import { disarmImageTileScaleDrag } from '../disarmImageTileScaleDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createRef = (dragState: TImageTileScaleDragState | null = null): RefObject<TImageTileScaleDragState | null> => ({
  current: dragState,
});

const DRAG_STATE: TImageTileScaleDragState = {
  anchor: { x: 0, y: 0 },
  nodeId: 'node-a',
  paintIndex: 0,
  startDistance: 100,
  startScale: 1,
};

describe('disarmImageTileScaleDrag', () => {
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
    disarmImageTileScaleDrag(canvas, pointerEvent(), createRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release pointer capture immediately', () => {
    // mock
    const canvas = createCanvas();
    const imageTileScaleDragRef = createRef(DRAG_STATE);

    // before
    disarmImageTileScaleDrag(canvas, pointerEvent(2), imageTileScaleDragRef);

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should clear the drag ref only once the current tick finishes', () => {
    // mock
    const canvas = createCanvas();
    const imageTileScaleDragRef = createRef(DRAG_STATE);

    // before
    disarmImageTileScaleDrag(canvas, pointerEvent(2), imageTileScaleDragRef);

    // result
    expect(imageTileScaleDragRef.current).not.toBeNull();
    vi.runAllTimers();
    expect(imageTileScaleDragRef.current).toBeNull();
  });
});
