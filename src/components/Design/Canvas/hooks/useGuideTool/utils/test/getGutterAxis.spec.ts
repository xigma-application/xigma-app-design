// utils
import { getGutterAxis } from '../getGutterAxis';

describe('getGutterAxis', () => {
  it('should return null when the rulers are hidden, even inside the gutter zone', () => {
    // result
    expect(getGutterAxis({ x: 5, y: 5 }, false, 0)).toBeNull();
  });

  it('should return "y" inside the top gutter', () => {
    // result
    expect(getGutterAxis({ x: 100, y: 5 }, true, 0)).toBe('y');
  });

  it('should return "x" inside the left gutter', () => {
    // result
    expect(getGutterAxis({ x: 5, y: 100 }, true, 0)).toBe('x');
  });

  it('should treat the corner (both gutters overlap) as the left gutter', () => {
    // result
    expect(getGutterAxis({ x: 5, y: 5 }, true, 0)).toBe('x');
  });

  it('should return null outside both gutters', () => {
    // result
    expect(getGutterAxis({ x: 100, y: 100 }, true, 0)).toBeNull();
  });

  it('should shift the left gutter past LeftPanel when it is showing', () => {
    // result — LeftPanel is 300px wide, so the left ruler strip sits at screen x 300-320; anything
    // left of that is under the panel itself, not the ruler
    expect(getGutterAxis({ x: 5, y: 100 }, true, 300)).toBeNull();
    expect(getGutterAxis({ x: 310, y: 100 }, true, 300)).toBe('x');
  });

  it('should shift the top gutter to start past LeftPanel too', () => {
    // result
    expect(getGutterAxis({ x: 100, y: 5 }, true, 300)).toBeNull();
    expect(getGutterAxis({ x: 310, y: 5 }, true, 300)).toBe('x');
    expect(getGutterAxis({ x: 400, y: 5 }, true, 300)).toBe('y');
  });
});
