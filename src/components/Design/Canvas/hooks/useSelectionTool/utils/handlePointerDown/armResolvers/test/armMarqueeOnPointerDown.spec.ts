// utils
import { armMarqueeOnPointerDown } from '../armMarqueeOnPointerDown';

const armMarqueeDragMock = vi.fn();

vi.mock('../../armMarqueeDrag', () => ({ armMarqueeDrag: (...args: unknown[]): unknown => armMarqueeDragMock(...args) }));

const context = (shiftKey: boolean): Record<string, unknown> => ({
  canvas: 'canvas',
  dispatch: 'dispatch',
  event: { shiftKey },
  point: { x: 1, y: 2 },
  selectionRefs: { marqueeStartRef: 'ref' },
});

describe('armMarqueeOnPointerDown', () => {
  it('should start a marquee from the pointer', () => {
    // mock
    const ctx = context(false);

    // before
    const result = armMarqueeOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(armMarqueeDragMock).toHaveBeenCalledWith('canvas', ctx.event, 'dispatch', 'ref', { x: 1, y: 2 });
  });

  it('should leave the pointer alone with Shift held', () => {
    // mock
    armMarqueeDragMock.mockClear();

    // result
    expect(armMarqueeOnPointerDown(context(true) as never)).toBeUndefined();
    expect(armMarqueeDragMock).not.toHaveBeenCalled();
  });
});
