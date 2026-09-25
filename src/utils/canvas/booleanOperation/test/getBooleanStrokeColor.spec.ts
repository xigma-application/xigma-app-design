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

  it('should return nothing without strokes or when the first visible stroke is not solid', () => {
    // result
    expect(getBooleanStrokeColor({})).toBeNull();
    expect(getBooleanStrokeColor({ strokes: [{ opacity: 100, stops: [], type: 'gradient-linear' } as never] })).toBeNull();
  });
});
