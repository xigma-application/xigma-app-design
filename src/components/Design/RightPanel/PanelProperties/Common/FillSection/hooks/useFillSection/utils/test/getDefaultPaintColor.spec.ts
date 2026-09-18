// utils
import { getDefaultPaintColor } from '../getDefaultPaintColor';

describe('getDefaultPaintColor', () => {
  it('should default a new fill to the light gray vector paint color', () => {
    expect(getDefaultPaintColor('fills')).toBe('#D9D9D9');
  });

  it('should default a new stroke to black', () => {
    expect(getDefaultPaintColor('strokes')).toBe('#000000');
  });
});
