// utils
import { armCornerRadiusOnPointerDown } from '../armCornerRadiusOnPointerDown';

const hitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getCornerRadiusHandleAtPoint', () => ({
  getCornerRadiusHandleAtPoint: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../armCornerRadiusDrag', () => ({ armCornerRadiusDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = {
  canvas: 'canvas',
  canvasRefs: { cornerRadius: { cornerRadiusDragRef: 'ref' } },
  event: 'event',
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  viewport: 'viewport',
};

describe('armCornerRadiusOnPointerDown', () => {
  it('should arm the corner radius drag when a handle is hit', () => {
    // mock
    hitMock.mockReturnValue({ bounds: 'bounds', corners: 'corners', nodeId: 'n', rotation: 15 });

    // before
    const result = armCornerRadiusOnPointerDown(context as never);

    // result
    expect(result).toBe(true);
    expect(hitMock).toHaveBeenCalledWith({ x: 1, y: 2 }, ['node'], 'viewport');
    expect(armMock).toHaveBeenCalledWith('canvas', 'event', 'ref', 'bounds', 'corners', 'n', 15, { x: 1, y: 2 });
  });

  it('should leave the pointer alone when no handle is hit', () => {
    // mock
    hitMock.mockReturnValue(null);
    armMock.mockClear();

    // result
    expect(armCornerRadiusOnPointerDown(context as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
