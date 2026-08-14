// utils
import { transformCoord } from '../transformCoord';

describe('transformCoord', () => {
  it('should return the coordinate unchanged when there is no anchor', () => {
    // result
    expect(transformCoord(42, null, 2)).toBe(42);
  });

  it('should scale the coordinate around the anchor', () => {
    // mock — anchor at 0, coord at 10, scale ×2 -> stays anchored at 0, distance doubles to 20
    // result
    expect(transformCoord(10, 0, 2)).toBe(20);
  });

  it('should flip the coordinate to the other side of the anchor for a negative scale', () => {
    // result
    expect(transformCoord(10, 0, -1)).toBe(-10);
  });
});
