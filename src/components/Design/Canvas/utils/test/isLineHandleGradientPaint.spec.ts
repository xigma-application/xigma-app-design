// utils
import { isLineHandleGradientPaint } from '../isLineHandleGradientPaint';

describe('isLineHandleGradientPaint', () => {
  it('should return true for a linear gradient paint', () => {
    expect(isLineHandleGradientPaint({ end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' })).toBe(
      true,
    );
  });

  it('should return true for a radial gradient paint', () => {
    expect(isLineHandleGradientPaint({ end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-radial' })).toBe(
      true,
    );
  });

  it('should return true for an angular gradient paint', () => {
    expect(isLineHandleGradientPaint({ end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-angular' })).toBe(
      true,
    );
  });

  it('should return true for a diamond gradient paint', () => {
    expect(isLineHandleGradientPaint({ end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-diamond' })).toBe(
      true,
    );
  });

  it('should return false for a solid paint', () => {
    expect(isLineHandleGradientPaint({ color: '#000000', opacity: 100, type: 'solid' })).toBe(false);
  });

  it('should return false when the paint is undefined', () => {
    expect(isLineHandleGradientPaint(undefined)).toBe(false);
  });
});
