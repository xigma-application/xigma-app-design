// utils
import { getGradientPointsFromAngle } from '../getGradientPointsFromAngle';

describe('getGradientPointsFromAngle', () => {
  it('should point left-to-right at angle 0', () => {
    expect(getGradientPointsFromAngle(0)).toEqual({ end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } });
  });

  it('should point top-to-bottom at angle 90', () => {
    expect(getGradientPointsFromAngle(90)).toEqual({ end: { x: 0.5, y: 1 }, start: { x: 0.5, y: 0 } });
  });

  it('should point right-to-left at angle 180', () => {
    expect(getGradientPointsFromAngle(180)).toEqual({ end: { x: 0, y: 0.5 }, start: { x: 1, y: 0.5 } });
  });

  it('should point bottom-to-top at angle 270', () => {
    expect(getGradientPointsFromAngle(270)).toEqual({ end: { x: 0.5, y: 0 }, start: { x: 0.5, y: 1 } });
  });

  it('should wrap a negative or out-of-range angle into the 0-360 lookup', () => {
    expect(getGradientPointsFromAngle(-90)).toEqual({ end: { x: 0.5, y: 0 }, start: { x: 0.5, y: 1 } });
    expect(getGradientPointsFromAngle(450)).toEqual({ end: { x: 0.5, y: 1 }, start: { x: 0.5, y: 0 } });
  });
});
