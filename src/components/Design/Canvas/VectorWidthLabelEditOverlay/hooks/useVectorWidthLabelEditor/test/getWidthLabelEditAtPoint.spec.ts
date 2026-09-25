// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getWidthLabelEditAtPoint } from '../getWidthLabelEditAtPoint';

const rectsMock = vi.fn();

vi.mock('../../../../utils/getVectorWidthLabelRects', () => ({
  getVectorWidthLabelRects: (...args: unknown[]): unknown => rectsMock(...args),
  isPointInVectorWidthLabelRect: (point: { x: number }, rect: { hitX: number }): boolean => point.x === rect.hitX,
}));

const rect = {
  badgeHeight: 10,
  badgeWidth: 30,
  center: { x: 5, y: 5 },
  hitX: 1,
  target: { nodeId: 'v', point: { id: 'p1', leftOffset: 2.4, rightOffset: 3 } },
};

describe('getWidthLabelEditAtPoint', () => {
  it('should start editing the width label under the pointer with the rounded full width', () => {
    // mock
    rectsMock.mockReturnValue([{ ...rect, hitX: 99 }, rect]);

    // result
    expect(getWidthLabelEditAtPoint({ x: 1, y: 0 }, {} as TCanvasRefs, {}, 1)).toEqual({
      badgeHeight: 10,
      badgeWidth: 30,
      center: { x: 5, y: 5 },
      nodeId: 'v',
      pointId: 'p1',
      value: 5,
    });
  });

  it('should return nothing off every width label', () => {
    // mock
    rectsMock.mockReturnValue([rect]);

    // result
    expect(getWidthLabelEditAtPoint({ x: 50, y: 0 }, {} as TCanvasRefs, {}, 1)).toBeNull();
  });
});
