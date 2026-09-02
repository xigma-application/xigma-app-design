// utils
import { toDraftRectWithDefault } from '../toDraftRectWithDefault';

describe('toDraftRectWithDefault', () => {
  it('should return the actual dragged rect when both dimensions meet the minimum size', () => {
    // result
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 60, y: 40 }, 100, false, 1)).toEqual({ height: 30, width: 50, x: 10, y: 10 });
  });

  it('should fall back to a top-left-anchored default rect on a plain click (zero drag)', () => {
    // result
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 10, y: 10 }, 100, false, 1)).toEqual({ height: 100, width: 100, x: 10, y: 10 });
  });

  it('should fall back to a center-anchored default rect when centered is true', () => {
    // result
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 10, y: 10 }, 100, true, 1)).toEqual({ height: 100, width: 100, x: -40, y: -40 });
  });

  it('should fall back to the default rect when only one dimension is below the minimum size', () => {
    // result — width (50) is fine, but height (0) is not
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 60, y: 10 }, 100, false, 1)).toEqual({ height: 100, width: 100, x: 10, y: 10 });
  });

  it('should not fall back to the default size for a small world-space drag that is still a deliberate screen-space drag at high zoom', () => {
    // mock — a 1x1 world-space drag at 256x zoom is a 256 screen-px drag, nowhere near "just a click"
    // result
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 11, y: 11 }, 100, false, 256)).toEqual({ height: 1, width: 1, x: 10, y: 10 });
  });

  it('should still fall back to the default size for a genuinely tiny drag even at high zoom', () => {
    // mock — at 256x zoom, a 0.005 world-unit drag is only ~1.28 screen px — still just a click
    // result
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 10.005, y: 10.005 }, 100, false, 256)).toEqual({
      height: 100,
      width: 100,
      x: 10,
      y: 10,
    });
  });

  it('should fall back to the default size for a drag that would be large enough in world space but not in screen space at low zoom', () => {
    // mock — at 0.1x zoom, a 15-world-unit drag is only 1.5 screen px — below the tolerance
    // result
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 25, y: 10 }, 100, false, 0.1)).toEqual({ height: 100, width: 100, x: 10, y: 10 });
  });

  it('should lock the dragged rect to a 1:1 square when Shift is held and the drag is big enough', () => {
    // result — width (50) drives, since it exceeds height (30)
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 60, y: 40 }, 100, false, 1, true)).toEqual({
      height: 50,
      width: 50,
      x: 10,
      y: 10,
    });
  });

  it('should default shiftKey to false when the caller omits it', () => {
    // result — unchanged free-form behavior, same as the very first test in this file
    expect(toDraftRectWithDefault({ x: 10, y: 10 }, { x: 60, y: 40 }, 100, false, 1)).toEqual({ height: 30, width: 50, x: 10, y: 10 });
  });
});
