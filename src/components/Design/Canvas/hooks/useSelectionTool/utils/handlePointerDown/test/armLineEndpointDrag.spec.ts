import { RefObject } from 'react';

// types
import { TEndpointDragState } from '../../../types';

// utils
import { armLineEndpointDrag } from '../armLineEndpointDrag';

const createCanvasMock = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn() }) as unknown as HTMLCanvasElement;

const createEndpointDragRef = (): RefObject<TEndpointDragState | null> => ({ current: null });

describe('armLineEndpointDrag', () => {
  it('should arm the endpoint drag for the given node and endpoint and capture the pointer', () => {
    // mock
    const canvas = createCanvasMock();
    const event = { pointerId: 3 } as PointerEvent;
    const endpointDragRef = createEndpointDragRef();

    // before
    armLineEndpointDrag(canvas, event, endpointDragRef, 'line-1', 'a');

    // result
    expect(endpointDragRef.current).toEqual({ endpoint: 'a', nodeId: 'line-1' });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
