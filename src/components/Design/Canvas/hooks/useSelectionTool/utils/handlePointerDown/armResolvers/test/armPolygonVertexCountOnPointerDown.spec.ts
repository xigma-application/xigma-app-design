// utils
import { armPolygonVertexCountOnPointerDown } from '../armPolygonVertexCountOnPointerDown';

const hitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getPolygonVertexCountHandleAtPoint', () => ({
  getPolygonVertexCountHandleAtPoint: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../armPolygonVertexCountDrag', () => ({ armPolygonVertexCountDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = {
  canvas: 'canvas',
  canvasRefs: { vertexCount: { polygonVertexCountDragRef: 'ref' } },
  event: 'event',
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  viewport: 'viewport',
};

describe('armPolygonVertexCountOnPointerDown', () => {
  it('should arm the drag when the handle is hit', () => {
    // mock
    hitMock.mockReturnValue({
      bounds: 'bounds-value',
      flipX: 'flipX-value',
      flipY: 'flipY-value',
      nodeId: 'nodeId-value',
      rotation: 'rotation-value',
    });

    // before
    const result = armPolygonVertexCountOnPointerDown(context as never);

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
      'flipX-value',
      'flipY-value',
    );
  });

  it('should leave the pointer alone when the handle is missed', () => {
    // mock
    hitMock.mockReturnValue(null);
    armMock.mockClear();

    // result
    expect(armPolygonVertexCountOnPointerDown(context as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
