// utils
import { parseCssColor } from '../parseCssColor';

describe('parseCssColor', () => {
  it('should parse an rgba() string into hex and a 0-100 alpha', () => {
    // before
    const result = parseCssColor('rgba(255, 0, 0, 0.5)');

    // result
    expect(result).toEqual({ alpha: 50, hex: '#ff0000' });
  });

  it('should default alpha to 100 when parsing an rgb() string', () => {
    // before
    const result = parseCssColor('rgb(0, 255, 0)');

    // result
    expect(result).toEqual({ alpha: 100, hex: '#00ff00' });
  });

  it('should tolerate extra whitespace', () => {
    // before
    const result = parseCssColor('rgba( 13 , 153 , 255 , 1 )');

    // result
    expect(result).toEqual({ alpha: 100, hex: '#0d99ff' });
  });

  it('should clamp channel and alpha values out of range', () => {
    // before
    const result = parseCssColor('rgba(999, 0, 0, 2)');

    // result
    expect(result).toEqual({ alpha: 100, hex: '#ff0000' });
  });

  it('should return null for an unparsable value', () => {
    // before
    const result = parseCssColor('not a color');

    // result
    expect(result).toBeNull();
  });
});
