// utils
import { armGroupBoundsOnPointerDown } from '../armGroupBoundsOnPointerDown';

const inBoundsMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../isPointInGroupBounds', () => ({ isPointInGroupBounds: (...args: unknown[]): unknown => inBoundsMock(...args) }));
vi.mock('../../armGroupBoundsDrag', () => ({ armGroupBoundsDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = (shiftKey: boolean): unknown => ({
  canvas: 'canvas',
  canvasRefs: 'refs',
  currentSelection: ['a'],
  event: { shiftKey },
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  selectionRefs: { dragStateRef: 'dragRef' },
});

describe('armGroupBoundsOnPointerDown', () => {
  beforeEach(() => {
    armMock.mockClear();
  });

  it('should drag the whole selection when pressed inside its bounds', () => {
    // mock
    inBoundsMock.mockReturnValue(true);
    const ctx = context(false) as { event: unknown };

    // before
    const result = armGroupBoundsOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(inBoundsMock).toHaveBeenCalledWith({ x: 1, y: 2 }, ['node']);
    expect(armMock).toHaveBeenCalledWith('canvas', ctx.event, 'dragRef', ['a'], { x: 1, y: 2 }, 'refs');
  });

  it('should leave the pointer alone outside the bounds or with Shift held', () => {
    // mock
    inBoundsMock.mockReturnValueOnce(false).mockReturnValueOnce(true);

    // result
    expect(armGroupBoundsOnPointerDown(context(false) as never)).toBeUndefined();
    expect(armGroupBoundsOnPointerDown(context(true) as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
