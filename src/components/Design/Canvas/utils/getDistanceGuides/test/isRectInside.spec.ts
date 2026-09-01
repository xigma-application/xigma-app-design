// utils
import { isRectInside } from '../isRectInside';

describe('isRectInside', () => {
  it('should report true when the inner edges sit fully within the outer edges', () => {
    expect(isRectInside({ bottom: 100, left: 0, right: 100, top: 0 }, { bottom: 80, left: 20, right: 70, top: 20 })).toBe(true);
  });

  it('should report true when the two rects are identical (edges flush on every side)', () => {
    expect(isRectInside({ bottom: 100, left: 0, right: 100, top: 0 }, { bottom: 100, left: 0, right: 100, top: 0 })).toBe(true);
  });

  it('should report false when the inner rect pokes past the outer rect on one side', () => {
    expect(isRectInside({ bottom: 100, left: 0, right: 100, top: 0 }, { bottom: 80, left: 20, right: 120, top: 20 })).toBe(false);
  });

  it('should report false for two rects that merely intersect diagonally', () => {
    expect(isRectInside({ bottom: 100, left: 0, right: 100, top: 0 }, { bottom: 150, left: 50, right: 150, top: 50 })).toBe(false);
  });
});
