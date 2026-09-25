// utils
import { armPolygonCornerRadiusOnPointerDown } from '../armPolygonCornerRadiusOnPointerDown';

const hitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getPolygonCornerRadiusHandleAtPoint', () => ({
  getPolygonCornerRadiusHandleAtPoint: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../armPolygonCornerRadiusDrag', () => ({ armPolygonCornerRadiusDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = {
  canvas: 'canvas',
  canvasRefs: { cornerRadius: { polygonCornerRadiusDragRef: 'ref' } },
  event: 'event',
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  viewport: 'viewport',
};

describe('armPolygonCornerRadiusOnPointerDown', () => {
  it('should arm the drag when the handle is hit', () => {
    // mock
    hitMock.mockReturnValue({
      bounds: 'bounds-value',
      flipX: 'flipX-value',
      flipY: 'flipY-value',
      nodeId: 'nodeId-value',
      rotation: 'rotation-value',
      sides: 'sides-value',
    });

    // before
    const result = armPolygonCornerRadiusOnPointerDown(context as never);

    // result
    expect(result).toBe(true);
    expect(hitMock).toHaveBeenCalledWith({ x: 1, y: 2 }, ['node'], 'viewport');
    expect(armMock).toHaveBeenCalledWith(
      'canvas',
      'event',
      'ref',
      'bounds-value',
      'nodeId-value',
      'rotation-value',
      'sides-value',
      'flipX-value',
      'flipY-value',
    );
  });

  it('should leave the pointer alone when the handle is missed', () => {
    // mock
    hitMock.mockReturnValue(null);
    armMock.mockClear();

    // result
    expect(armPolygonCornerRadiusOnPointerDown(context as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
