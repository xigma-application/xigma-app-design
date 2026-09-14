// types
import { TPoint } from 'types/canvas';

// utils
import { getGradientEndpointsAtAngle } from '../getGradientEndpointsAtAngle';

const expectPointCloseTo = (point: TPoint, expected: TPoint): void => {
  expect(point.x).toBeCloseTo(expected.x, 5);
  expect(point.y).toBeCloseTo(expected.y, 5);
};

describe('getGradientEndpointsAtAngle', () => {
  it('should place start at the given angle and end at the opposite side, both on the rect edge', () => {
    const bounds = { height: 50, width: 100, x: 0, y: 0 };
    const { end, start } = getGradientEndpointsAtAngle(bounds, 0);

    expectPointCloseTo(start, { x: 100, y: 25 });
    expectPointCloseTo(end, { x: 0, y: 25 });
  });

  it('should rotate both points together when the angle changes', () => {
    const bounds = { height: 50, width: 100, x: 0, y: 0 };
    const { end, start } = getGradientEndpointsAtAngle(bounds, Math.PI / 2);

    expectPointCloseTo(start, { x: 50, y: 50 });
    expectPointCloseTo(end, { x: 50, y: 0 });
  });

  it('should account for the rect origin', () => {
    const bounds = { height: 50, width: 100, x: 10, y: 20 };
    const { end, start } = getGradientEndpointsAtAngle(bounds, 0);

    expectPointCloseTo(start, { x: 110, y: 45 });
    expectPointCloseTo(end, { x: 10, y: 45 });
  });
});
