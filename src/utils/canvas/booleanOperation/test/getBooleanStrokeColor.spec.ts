// utils
import { getBooleanStrokeColor } from '../getBooleanStrokeColor';

describe('getBooleanStrokeColor', () => {
  it('should return the color of the first visible solid stroke', () => {
    // result
    expect(
      getBooleanStrokeColor({
        strokes: [
          { color: '#111111', opacity: 100, type: 'solid', visible: false },
          { color: '#222222', opacity: 100, type: 'solid' },
        ],
      }),
    ).toBe('#222222');
  });

  it('should fall back to the first stop color of a gradient stroke', () => {
    // mock
    const stops = [
      { color: '#ff0000', opacity: 100, position: 0 },
      { color: '#0000ff', opacity: 100, position: 1 },
    ];

    // result
    expect(getBooleanStrokeColor({ strokes: [{ opacity: 100, stops, type: 'gradient-radial' } as never] })).toBe('#ff0000');
    expect(getBooleanStrokeColor({ strokes: [{ opacity: 100, stops, type: 'gradient-angular' } as never] })).toBe('#ff0000');
    expect(getBooleanStrokeColor({ strokes: [{ opacity: 100, stops, type: 'gradient-diamond' } as never] })).toBe('#ff0000');
  });

  it('should return nothing without strokes, for a gradient without stops, or for an image stroke', () => {
    // result
    expect(getBooleanStrokeColor({})).toBeNull();
    expect(getBooleanStrokeColor({ strokes: [{ opacity: 100, stops: [], type: 'gradient-linear' } as never] })).toBeNull();
    expect(getBooleanStrokeColor({ strokes: [{ opacity: 100, type: 'image' } as never] })).toBeNull();
  });
});
