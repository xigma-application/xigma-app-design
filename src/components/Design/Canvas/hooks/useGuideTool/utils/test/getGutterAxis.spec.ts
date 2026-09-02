// utils
import { getGutterAxis } from '../getGutterAxis';

describe('getGutterAxis', () => {
  it('should return null when the rulers are hidden, even inside the gutter zone', () => {
    // result
    expect(getGutterAxis({ x: 5, y: 5 }, false)).toBeNull();
  });

  it('should return "y" inside the top gutter', () => {
    // result
    expect(getGutterAxis({ x: 100, y: 5 }, true)).toBe('y');
  });

  it('should return "x" inside the left gutter', () => {
    // result
    expect(getGutterAxis({ x: 5, y: 100 }, true)).toBe('x');
  });

  it('should treat the corner (both gutters overlap) as the left gutter', () => {
    // result
    expect(getGutterAxis({ x: 5, y: 5 }, true)).toBe('x');
  });

  it('should return null outside both gutters', () => {
    // result
    expect(getGutterAxis({ x: 100, y: 100 }, true)).toBeNull();
  });
});
