// utils
import { armEllipseArcOnPointerDown } from '../armEllipseArcOnPointerDown';

const hitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getEllipseArcHandleAtPoint', () => ({
  getEllipseArcHandleAtPoint: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../armEllipseArcDrag', () => ({ armEllipseArcDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = {
  canvas: 'canvas',
  canvasRefs: { ellipseArc: { ellipseArcDragRef: 'ref' } },
  event: 'event',
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  viewport: 'viewport',
};

describe('armEllipseArcOnPointerDown', () => {
  it('should arm the drag when the handle is hit', () => {
    // mock
    hitMock.mockReturnValue({ bounds: 'bounds', flipX: true, flipY: false, nodeId: 'n', rotation: 15 });

    // before
    const result = armEllipseArcOnPointerDown(context as never);

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
    expect(armEllipseArcOnPointerDown(context as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
