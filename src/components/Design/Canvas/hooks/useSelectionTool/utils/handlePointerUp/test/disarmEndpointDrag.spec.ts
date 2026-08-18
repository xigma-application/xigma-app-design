import { RefObject } from 'react';

// types
import { TEndpointDragState } from 'types/design/selectionTool/types';

// utils
import { disarmEndpointDrag } from '../disarmEndpointDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createEndpointDragRef = (endpointDragState: TEndpointDragState | null = null): RefObject<TEndpointDragState | null> => ({
  current: endpointDragState,
});

describe('disarmEndpointDrag', () => {
  it('should do nothing when no endpoint drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmEndpointDrag(canvas, pointerEvent(), createEndpointDragRef());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the endpoint-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const endpointDragRef = createEndpointDragRef({ endpoint: 'a', nodeId: 'line-1' });

    // before
    disarmEndpointDrag(canvas, pointerEvent(2), endpointDragRef);

    // result
    expect(endpointDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });
});
