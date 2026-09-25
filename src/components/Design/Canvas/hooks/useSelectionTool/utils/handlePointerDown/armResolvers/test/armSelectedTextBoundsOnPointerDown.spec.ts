// utils
import { armSelectedTextBoundsOnPointerDown } from '../armSelectedTextBoundsOnPointerDown';

const insideMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../isPointInSelectedTextBounds', () => ({
  isPointInSelectedTextBounds: (...args: unknown[]): unknown => insideMock(...args),
}));
vi.mock('../../armGroupBoundsDrag', () => ({ armGroupBoundsDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = (shiftKey: boolean): Record<string, unknown> => ({
  canvas: 'canvas',
  canvasRefs: 'refs',
  currentSelection: ['a'],
  event: { shiftKey },
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  selectionRefs: { dragStateRef: 'dragRef' },
});

describe('armSelectedTextBoundsOnPointerDown', () => {
  beforeEach(() => {
    armMock.mockClear();
  });

  it('should drag the selection when pressed inside the selected bounds', () => {
    // mock
    insideMock.mockReturnValue(true);
    const ctx = context(false);

    // before
    const result = armSelectedTextBoundsOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(insideMock).toHaveBeenCalledWith({ x: 1, y: 2 }, ['node']);
    expect(armMock).toHaveBeenCalledWith('canvas', ctx.event, 'dragRef', ['a'], { x: 1, y: 2 }, 'refs');
  });

  it('should leave the pointer alone outside the bounds or with Shift held', () => {
    // mock
    insideMock.mockReturnValueOnce(false).mockReturnValueOnce(true);

    // result
    expect(armSelectedTextBoundsOnPointerDown(context(false) as never)).toBeUndefined();
    expect(armSelectedTextBoundsOnPointerDown(context(true) as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
