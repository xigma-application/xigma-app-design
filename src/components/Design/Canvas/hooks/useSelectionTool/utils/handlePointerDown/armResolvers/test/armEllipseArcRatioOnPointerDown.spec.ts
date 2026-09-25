// utils
import { armEllipseArcRatioOnPointerDown } from '../armEllipseArcRatioOnPointerDown';

const hitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getEllipseArcRatioHandleAtPoint', () => ({
  getEllipseArcRatioHandleAtPoint: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../armEllipseArcRatioDrag', () => ({ armEllipseArcRatioDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = {
  canvas: 'canvas',
  canvasRefs: { ellipseArc: { ellipseArcRatioDragRef: 'ref' } },
  event: 'event',
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  viewport: 'viewport',
};

describe('armEllipseArcRatioOnPointerDown', () => {
  it('should arm the drag when the handle is hit', () => {
    // mock
    hitMock.mockReturnValue({ bounds: 'bounds', flipX: true, flipY: false, nodeId: 'n', rotation: 15 });

    // before
    const result = armEllipseArcRatioOnPointerDown(context as never);

    // result
    expect(result).toBe(true);
    expect(hitMock).toHaveBeenCalledWith({ x: 1, y: 2 }, ['node'], 'viewport');
    expect(armMock).toHaveBeenCalledWith('canvas', 'event', 'ref', 'bounds', 'n', 15, true, false);
  });

  it('should leave the pointer alone when the handle is missed', () => {
    // mock
    hitMock.mockReturnValue(null);
    armMock.mockClear();

    // result
    expect(armEllipseArcRatioOnPointerDown(context as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
