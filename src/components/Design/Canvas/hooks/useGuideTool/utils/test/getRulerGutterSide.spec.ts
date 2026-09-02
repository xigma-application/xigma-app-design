// utils
import { getRulerGutterSide } from '../getRulerGutterSide';

describe('getRulerGutterSide', () => {
  it('should return null when the rulers are hidden, even inside the gutter zone', () => {
    // result
    expect(getRulerGutterSide({ x: 5, y: 5 }, false, 0)).toBeNull();
  });

  it('should return "top" inside the top gutter', () => {
    // result
    expect(getRulerGutterSide({ x: 100, y: 5 }, true, 0)).toBe('top');
  });

  it('should return "left" inside the left gutter', () => {
    // result
    expect(getRulerGutterSide({ x: 5, y: 100 }, true, 0)).toBe('left');
  });

  it('should treat the corner (both gutters overlap) as the left gutter', () => {
    // result
    expect(getRulerGutterSide({ x: 5, y: 5 }, true, 0)).toBe('left');
  });

  it('should return null outside both gutters', () => {
    // result
    expect(getRulerGutterSide({ x: 100, y: 100 }, true, 0)).toBeNull();
  });

  it('should shift the left gutter past LeftPanel when it is showing', () => {
    // result
    expect(getRulerGutterSide({ x: 5, y: 100 }, true, 300)).toBeNull();
    expect(getRulerGutterSide({ x: 310, y: 100 }, true, 300)).toBe('left');
  });

  it('should shift the top gutter to start past LeftPanel too', () => {
    // result
    expect(getRulerGutterSide({ x: 100, y: 5 }, true, 300)).toBeNull();
    expect(getRulerGutterSide({ x: 310, y: 5 }, true, 300)).toBe('left');
    expect(getRulerGutterSide({ x: 400, y: 5 }, true, 300)).toBe('top');
  });
});
