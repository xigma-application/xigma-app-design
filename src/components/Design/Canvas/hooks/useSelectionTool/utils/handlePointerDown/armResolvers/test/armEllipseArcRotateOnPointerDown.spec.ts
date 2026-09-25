// utils
import { armEllipseArcRotateOnPointerDown } from '../armEllipseArcRotateOnPointerDown';

const hitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getEllipseArcRotateHandleAtPoint', () => ({
  getEllipseArcRotateHandleAtPoint: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../armEllipseArcRotateDrag', () => ({ armEllipseArcRotateDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = {
  canvas: 'canvas',
  canvasRefs: { ellipseArc: { ellipseArcRotateDragRef: 'ref' } },
  event: 'event',
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  viewport: 'viewport',
};

describe('armEllipseArcRotateOnPointerDown', () => {
  it('should arm the drag when the handle is hit', () => {
    // mock
    hitMock.mockReturnValue({ bounds: 'bounds', flipX: true, flipY: false, nodeId: 'n', rotation: 15 });

    // before
    const result = armEllipseArcRotateOnPointerDown(context as never);

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
    expect(armEllipseArcRotateOnPointerDown(context as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
