// utils
import { doScissorRectsOverlap } from '../doScissorRectsOverlap';

const rect = { height: 10, width: 10, x: 0, y: 0 };

describe('doScissorRectsOverlap', () => {
  it('should be true for rects that share an area', () => {
    // result
    expect(doScissorRectsOverlap(rect, { height: 10, width: 10, x: 5, y: 5 })).toBe(true);
  });

  it('should be false for rects that only touch or lie apart on either axis', () => {
    // result
    expect(doScissorRectsOverlap(rect, { height: 10, width: 10, x: 10, y: 0 })).toBe(false);
    expect(doScissorRectsOverlap(rect, { height: 10, width: 10, x: -10, y: 0 })).toBe(false);
    expect(doScissorRectsOverlap(rect, { height: 10, width: 10, x: 0, y: 10 })).toBe(false);
    expect(doScissorRectsOverlap(rect, { height: 10, width: 10, x: 0, y: -10 })).toBe(false);
  });
});
