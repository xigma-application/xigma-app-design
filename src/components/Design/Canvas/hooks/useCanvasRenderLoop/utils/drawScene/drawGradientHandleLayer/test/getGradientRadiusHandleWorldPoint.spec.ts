// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientRadiusHandleWorldPoint } from '../getGradientRadiusHandleWorldPoint';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const paint: TGradientPaint = {
  end: { x: 1, y: 0.5 },
  opacity: 100,
  start: { x: 0, y: 0.5 },
  stops: [],
  type: 'gradient-radial',
};

describe('getGradientRadiusHandleWorldPoint', () => {
  it('should map the normalized radius handle point into world space', () => {
    expect(getGradientRadiusHandleWorldPoint(bounds, 0, paint)).toEqual({ x: 0, y: 150 });
  });

  it('should offset by the bounds origin', () => {
    expect(getGradientRadiusHandleWorldPoint({ ...bounds, x: 200, y: 300 }, 0, paint)).toEqual({ x: 200, y: 450 });
  });

  it('should rotate the handle around the bounds center when the node is rotated', () => {
    const point = getGradientRadiusHandleWorldPoint(bounds, 90, paint);

    expect(point.x).toBeCloseTo(-50, 5);
    expect(point.y).toBeCloseTo(0, 5);
  });
});
