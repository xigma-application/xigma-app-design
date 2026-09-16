// utils
import { getFillRowSwatchHex } from '../getFillRowSwatchHex';

describe('getFillRowSwatchHex', () => {
  it("should return the paint's own color for a solid paint", () => {
    expect(getFillRowSwatchHex({ color: '#ff0000', opacity: 100, type: 'solid' })).toBe('#ff0000');
  });

  it('should return white for a pattern paint', () => {
    expect(
      getFillRowSwatchHex({
        alignmentIndex: 0,
        direction: 'horizontal',
        offsetX: 0,
        offsetY: 0,
        opacity: 100,
        scale: 100,
        spacingX: 0,
        spacingY: 0,
        tileType: 'rectangular',
        type: 'pattern',
      }),
    ).toBe('#ffffff');
  });

  it('should return white for an image paint', () => {
    expect(getFillRowSwatchHex({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' })).toBe('#ffffff');
  });

  it('should return the first stop color for a gradient paint', () => {
    expect(
      getFillRowSwatchHex({
        end: { x: 1, y: 0 },
        opacity: 100,
        start: { x: 0, y: 0 },
        stops: [{ color: '#00ff00', opacity: 100, position: 0 }],
        type: 'gradient-linear',
      }),
    ).toBe('#00ff00');
  });

  it('should fall back to black when a gradient paint has no stops', () => {
    expect(
      getFillRowSwatchHex({ end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' }),
    ).toBe('#000000');
  });
});
