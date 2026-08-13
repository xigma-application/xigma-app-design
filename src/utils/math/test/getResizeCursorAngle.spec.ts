// utils
import { getResizeCursorAngle } from '../getResizeCursorAngle';

describe('getResizeCursorAngle', () => {
  it('should return the rotation unchanged for the east/west handles', () => {
    // result
    expect(getResizeCursorAngle('e', 0)).toBe(0);
    expect(getResizeCursorAngle('w', 10)).toBe(10);
  });

  it('should offset by 90 degrees for the north/south handles', () => {
    // result
    expect(getResizeCursorAngle('n', 0)).toBe(90);
    expect(getResizeCursorAngle('s', 10)).toBe(100);
  });

  it('should offset by -45 degrees for the north-east/south-west handles', () => {
    // result
    expect(getResizeCursorAngle('ne', 0)).toBe(-45);
    expect(getResizeCursorAngle('sw', 10)).toBe(-35);
  });

  it('should offset by 45 degrees for the north-west/south-east handles', () => {
    // result
    expect(getResizeCursorAngle('nw', 0)).toBe(45);
    expect(getResizeCursorAngle('se', 10)).toBe(55);
  });
});
