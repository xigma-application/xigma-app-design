// utils
import { isEllipseHandleGradientPaint } from '../isEllipseHandleGradientPaint';

describe('isEllipseHandleGradientPaint', () => {
  it('should return true for a radial gradient paint', () => {
    expect(isEllipseHandleGradientPaint({ end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-radial' })).toBe(
      true,
    );
  });

  it('should return true for an angular gradient paint', () => {
    expect(isEllipseHandleGradientPaint({ end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-angular' })).toBe(
      true,
    );
  });

  it('should return true for a diamond gradient paint', () => {
    expect(isEllipseHandleGradientPaint({ end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-diamond' })).toBe(
      true,
    );
  });

  it('should return false for a linear gradient paint', () => {
    expect(isEllipseHandleGradientPaint({ end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' })).toBe(
      false,
    );
  });

  it('should return false for undefined', () => {
    expect(isEllipseHandleGradientPaint(undefined)).toBe(false);
  });
});
