// utils
import { armPathOffsetOnPointerDown } from '../armPathOffsetOnPointerDown';

const hitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getPathTextOffsetHandleAtPoint', () => ({
  getPathTextOffsetHandleAtPoint: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../armPathOffsetDrag', () => ({ armPathOffsetDrag: (...args: unknown[]): unknown => armMock(...args) }));

const setClassName = vi.fn();
const context = {
  canvas: 'canvas',
  event: 'event',
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  selectionRefs: { pathOffsetDragRef: 'ref' },
  setClassName,
  viewport: 'viewport',
};

describe('armPathOffsetOnPointerDown', () => {
  it('should arm dragging the text path offset handle when hit', () => {
    // mock
    hitMock.mockReturnValue({ nodeId: 'text' });

    // before
    const result = armPathOffsetOnPointerDown(context as never);

    // result
    expect(result).toBe(true);
    expect(hitMock).toHaveBeenCalledWith({ x: 1, y: 2 }, ['node'], 'viewport', expect.any(Object));
    expect(armMock).toHaveBeenCalledWith('canvas', 'event', 'ref', 'text', setClassName);
  });

  it('should leave the pointer alone when the handle is missed', () => {
    // mock
    hitMock.mockReturnValue(null);
    armMock.mockClear();

    // result
    expect(armPathOffsetOnPointerDown(context as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
