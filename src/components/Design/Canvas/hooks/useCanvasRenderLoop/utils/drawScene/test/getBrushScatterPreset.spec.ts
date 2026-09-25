// utils
import { getBrushScatterPreset } from '../getBrushScatterPreset';

describe('getBrushScatterPreset', () => {
  it('should return the preset of the given slot', () => {
    // result
    expect(getBrushScatterPreset(3)).toEqual({ aspect: 1.5, dotScale: 1.3, dots: 160, sigma: 0.18 });
  });

  it('should wrap indices outside the preset range, including negative ones', () => {
    // result
    expect(getBrushScatterPreset(13)).toEqual(getBrushScatterPreset(3));
    expect(getBrushScatterPreset(-7)).toEqual(getBrushScatterPreset(3));
  });
});
