// utils
import { getGlassValidWindow } from '../getGlassValidWindow';

describe('getGlassValidWindow', () => {
  it('should cover the whole rect when it is not clipped', () => {
    // result
    expect(getGlassValidWindow({ height: 10, width: 20, x: 5, y: 6 })).toEqual({
      localX: 0,
      localY: 0,
      validBottom: 0,
      validLeft: 0,
      validRight: 20,
      validTop: 10,
    });
  });

  it('should shrink by the margin on every clipped edge', () => {
    // result
    expect(
      getGlassValidWindow({ height: 10, margin: 2, originX: 0, originY: 0, rawHeight: 30, rawWidth: 40, width: 20, x: 5, y: 6 }),
    ).toEqual({
      localX: 5,
      localY: 6,
      validBottom: 8,
      validLeft: 7,
      validRight: 23,
      validTop: 14,
    });
  });
});
