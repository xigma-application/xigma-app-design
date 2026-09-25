// utils
import { armStarRatioOnPointerDown } from '../armStarRatioOnPointerDown';

const hitMock = vi.fn();
const armMock = vi.fn();

vi.mock('../../../../../../utils/getStarRatioHandleAtPoint', () => ({
  getStarRatioHandleAtPoint: (...args: unknown[]): unknown => hitMock(...args),
}));
vi.mock('../../armStarRatioDrag', () => ({ armStarRatioDrag: (...args: unknown[]): unknown => armMock(...args) }));

const context = {
  canvas: 'canvas',
  canvasRefs: { starRatio: { starRatioDragRef: 'ref' } },
  event: 'event',
  point: { x: 1, y: 2 },
  selectedNodes: ['node'],
  viewport: 'viewport',
};

describe('armStarRatioOnPointerDown', () => {
  it('should arm the drag when the handle is hit', () => {
    // mock
    hitMock.mockReturnValue({
      bounds: 'bounds-value',
      flipX: 'flipX-value',
      flipY: 'flipY-value',
      nodeId: 'nodeId-value',
      points: 'points-value',
      rotation: 'rotation-value',
    });

    // before
    const result = armStarRatioOnPointerDown(context as never);

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
      'points-value',
      'flipX-value',
      'flipY-value',
    );
  });

  it('should leave the pointer alone when the handle is missed', () => {
    // mock
    hitMock.mockReturnValue(null);
    armMock.mockClear();

    // result
    expect(armStarRatioOnPointerDown(context as never)).toBeUndefined();
    expect(armMock).not.toHaveBeenCalled();
  });
});
