// utils
import { getAxisLockedPoint } from '../getAxisLockedPoint';

describe('getAxisLockedPoint', () => {
  it('should hold the anchor y and follow the current x when locked to the x axis', () => {
    // result
    expect(getAxisLockedPoint({ x: 0, y: 10 }, { x: 25, y: 40 }, 'x')).toEqual({ x: 25, y: 10 });
  });

  it('should hold the anchor x and follow the current y when locked to the y axis', () => {
    // result
    expect(getAxisLockedPoint({ x: 0, y: 10 }, { x: 25, y: 40 }, 'y')).toEqual({ x: 0, y: 40 });
  });
});
