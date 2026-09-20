// types
import { TProgressiveBlurDragState } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { disarmProgressiveBlurDrag } from '../disarmProgressiveBlurDrag';

const DRAG_STATE: TProgressiveBlurDragState = { effectIndex: 0, endpoint: 'start', nodeId: 'n1' };

describe('disarmProgressiveBlurDrag', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should do nothing when no drag is in progress', () => {
    // mock
    const canvas = { releasePointerCapture: vi.fn() } as unknown as HTMLCanvasElement;

    // action
    disarmProgressiveBlurDrag(canvas, { pointerId: 1 } as PointerEvent, { current: null }, createCanvasRefs());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should release the pointer and clear the guide now, and the drag state on the next tick', () => {
    // mock
    const canvas = { releasePointerCapture: vi.fn() } as unknown as HTMLCanvasElement;
    const dragRef = { current: DRAG_STATE as TProgressiveBlurDragState | null };
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.alignmentGuideRef.current = { horizontal: null, vertical: null };

    // action
    disarmProgressiveBlurDrag(canvas, { pointerId: 3 } as PointerEvent, dragRef, canvasRefs);

    // result
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(3);
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
    expect(dragRef.current).toEqual(DRAG_STATE);

    // action
    vi.runAllTimers();

    // result
    expect(dragRef.current).toBeNull();
  });
});
