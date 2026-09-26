// utils
import { isColorPaint } from '../isColorPaint';

describe('isColorPaint', () => {
  it('should accept a solid and a gradient paint', () => {
    // result
    expect(isColorPaint({ color: '#000000', opacity: 100, type: 'solid' })).toBe(true);
    expect(isColorPaint({ end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-radial' })).toBe(true);
  });

  it('should reject an image paint', () => {
    // result
    expect(isColorPaint({ opacity: 100, ref: 'r', rotation: 0, scaleMode: 'fill', type: 'image' })).toBe(false);
  });
});
