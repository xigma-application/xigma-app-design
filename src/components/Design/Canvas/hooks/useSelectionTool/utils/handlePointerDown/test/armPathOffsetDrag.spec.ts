import { RefObject } from 'react';

// types
import { TPathOffsetDragState } from 'types/design/selectionTool/types';

// utils
import { armPathOffsetDrag } from '../armPathOffsetDrag';

const createCanvasMock = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn() }) as unknown as HTMLCanvasElement;

const createPathOffsetDragRef = (): RefObject<TPathOffsetDragState | null> => ({ current: null });

describe('armPathOffsetDrag', () => {
  it('should arm the path-offset drag for the given node and capture the pointer', () => {
    // mock
    const canvas = createCanvasMock();
    const event = { pointerId: 3 } as PointerEvent;
    const pathOffsetDragRef = createPathOffsetDragRef();
    const setClassName = vi.fn();

    // before
    armPathOffsetDrag(canvas, event, pathOffsetDragRef, 'text-1', setClassName);

    // result
    expect(pathOffsetDragRef.current).toEqual({ nodeId: 'text-1' });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
    expect(setClassName).toHaveBeenCalledWith('pressing');
  });
});
