// utils
import { toDraftRectWithDefault } from '../toDraftRectWithDefault';

describe('toDraftRectWithDefault', () => {
  it('should return the actual dragged rect when both dimensions meet the minimum size', () => {
    // result
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 60, y: 40 }, 100, false)).toEqual({ height: 30, width: 50, x: 10, y: 10 });
  });

  it('should fall back to a top-left-anchored default rect on a plain click (zero drag)', () => {
    // result
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 10, y: 10 }, 100, false)).toEqual({ height: 100, width: 100, x: 10, y: 10 });
  });

  it('should fall back to a center-anchored default rect when centered is true', () => {
    // result
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 10, y: 10 }, 100, true)).toEqual({ height: 100, width: 100, x: -40, y: -40 });
  });

  it('should fall back to the default rect when only one dimension is below the minimum size', () => {
    // result — width (50) is fine, but height (0) is not
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 60, y: 10 }, 100, false)).toEqual({ height: 100, width: 100, x: 10, y: 10 });
  });
});
