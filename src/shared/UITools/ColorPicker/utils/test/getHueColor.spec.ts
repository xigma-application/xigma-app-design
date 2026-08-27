// utils
import { getHueColor } from '../getHueColor';

describe('getHueColor', () => {
  it('should return pure red for hue 0', () => {
    expect(getHueColor(0)).toBe('#ff0000');
  });

  it('should return pure green for hue 120', () => {
    expect(getHueColor(120)).toBe('#00ff00');
  });

  it('should return pure blue for hue 240', () => {
    expect(getHueColor(240)).toBe('#0000ff');
  });
});
