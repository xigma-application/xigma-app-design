// utils
import { getAutoLayoutPaddingCursorAngle } from '../getAutoLayoutPaddingCursorAngle';

describe('getAutoLayoutPaddingCursorAngle', () => {
  it('should use the frame rotation directly for a top/bottom, already-padded side', () => {
    // result
    expect(getAutoLayoutPaddingCursorAngle('top', 0, false)).toBe(0);
    expect(getAutoLayoutPaddingCursorAngle('bottom', 15, false)).toBe(15);
  });

  it('should add 90deg for a left/right, already-padded side', () => {
    // result
    expect(getAutoLayoutPaddingCursorAngle('left', 0, false)).toBe(90);
    expect(getAutoLayoutPaddingCursorAngle('right', 15, false)).toBe(105);
  });

  it('should give each zero-padding side its own distinct angle, not one shared per axis', () => {
    // result — a 90deg step walking clockwise: top, right, bottom, left
    expect(getAutoLayoutPaddingCursorAngle('top', 0, true)).toBe(-90);
    expect(getAutoLayoutPaddingCursorAngle('right', 0, true)).toBe(0);
    expect(getAutoLayoutPaddingCursorAngle('bottom', 0, true)).toBe(90);
    expect(getAutoLayoutPaddingCursorAngle('left', 0, true)).toBe(180);
  });

  it('should add the frame rotation on top of each zero-padding side’s own offset', () => {
    // result
    expect(getAutoLayoutPaddingCursorAngle('right', 15, true)).toBe(15);
    expect(getAutoLayoutPaddingCursorAngle('left', 15, true)).toBe(195);
  });
});
