// utils
import { isBoundsLargeEnoughForHandles } from '../isBoundsLargeEnoughForHandles';

describe('isBoundsLargeEnoughForHandles', () => {
  it('should return true when the smaller dimension, scaled by zoom, meets the minimum screen size', () => {
    // result
    expect(isBoundsLargeEnoughForHandles({ height: 100, width: 100, x: 0, y: 0 }, { x: 0, y: 0, zoom: 1 })).toBe(true);
  });

  it('should return false once the shape renders too small on screen', () => {
    // result
    expect(isBoundsLargeEnoughForHandles({ height: 100, width: 100, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.01 })).toBe(false);
  });

  it('should use the smaller of width/height, not the larger', () => {
    // result — width alone would pass at zoom 1, but height (10) does not meet the threshold
    expect(isBoundsLargeEnoughForHandles({ height: 10, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 1 })).toBe(false);
  });
});
