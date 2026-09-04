// utils
import { getAutoLayoutLineLength } from '../getAutoLayoutLineLength';

describe('getAutoLayoutLineLength', () => {
  it('should return zero for an empty line', () => {
    expect(getAutoLayoutLineLength(true, 10, [])).toBe(0);
  });

  it('should sum widths plus gaps on the horizontal axis', () => {
    const line = [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 40 },
    ];

    expect(getAutoLayoutLineLength(true, 10, line)).toBe(80);
  });

  it('should sum heights plus gaps on the vertical axis', () => {
    const line = [
      { height: 30, id: 'a', width: 20 },
      { height: 40, id: 'b', width: 20 },
    ];

    expect(getAutoLayoutLineLength(false, 10, line)).toBe(80);
  });
});
