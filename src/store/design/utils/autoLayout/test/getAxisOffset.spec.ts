// utils
import { getAxisOffset } from '../getAxisOffset';

describe('getAxisOffset', () => {
  it('should return zero for "start"', () => {
    expect(getAxisOffset('start', 100, 20)).toBe(0);
  });

  it('should centre the content within the container for "center"', () => {
    expect(getAxisOffset('center', 100, 20)).toBe(40);
  });

  it('should push the content flush against the far edge for "end"', () => {
    expect(getAxisOffset('end', 100, 20)).toBe(80);
  });
});
