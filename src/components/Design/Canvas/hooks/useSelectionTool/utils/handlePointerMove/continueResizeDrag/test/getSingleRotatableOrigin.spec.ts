// utils
import { getSingleRotatableOrigin } from '../getSingleRotatableOrigin';

describe('getSingleRotatableOrigin', () => {
  it('should return the single origin when exactly one node is being resized', () => {
    // action & result
    expect(getSingleRotatableOrigin([['a', { flip: null, height: 10, rotation: 30, width: 10, x: 0, y: 0 }]])).toEqual({
      flip: null,
      height: 10,
      rotation: 30,
      width: 10,
      x: 0,
      y: 0,
    });
  });

  it('should return null when more than one node is being resized', () => {
    // action & result
    expect(
      getSingleRotatableOrigin([
        ['a', { flip: null, height: 10, rotation: 0, width: 10, x: 0, y: 0 }],
        ['b', { flip: null, height: 10, rotation: 0, width: 10, x: 20, y: 0 }],
      ]),
    ).toBeNull();
  });

  it('should return null when the single origin is a line (no rotation concept)', () => {
    // action & result
    expect(getSingleRotatableOrigin([['a', { x1: 0, x2: 10, y1: 0, y2: 10 }]])).toBeNull();
  });
});
