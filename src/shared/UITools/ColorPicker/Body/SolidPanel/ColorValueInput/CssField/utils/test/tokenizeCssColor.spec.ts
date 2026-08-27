// utils
import { tokenizeCssColor } from '../tokenizeCssColor';

describe('tokenizeCssColor', () => {
  it('should locate each channel token inside an rgba() string', () => {
    // before
    const result = tokenizeCssColor('rgba(13, 153, 255, 1)');

    // result
    expect(result).toEqual([
      { channel: 'r', end: 7, start: 5 },
      { channel: 'g', end: 12, start: 9 },
      { channel: 'b', end: 17, start: 14 },
      { channel: 'a', end: 20, start: 19 },
    ]);
  });

  it('should locate each channel token inside an rgb() string with no alpha', () => {
    // before
    const result = tokenizeCssColor('rgb(0, 255, 0)');

    // result
    expect(result).toEqual([
      { channel: 'r', end: 5, start: 4 },
      { channel: 'g', end: 10, start: 7 },
      { channel: 'b', end: 13, start: 12 },
    ]);
  });

  it('should return null for an unparsable value', () => {
    // before
    const result = tokenizeCssColor('not a color');

    // result
    expect(result).toBeNull();
  });
});
