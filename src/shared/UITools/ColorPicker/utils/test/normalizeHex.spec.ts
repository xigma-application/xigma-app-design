// utils
import { normalizeHex } from '../normalizeHex';

describe('normalizeHex', () => {
  it('should lowercase and prefix a hex value with #', () => {
    expect(normalizeHex('FF0000')).toBe('#ff0000');
  });

  it('should not duplicate the # when the value already has one', () => {
    expect(normalizeHex('#FF0000')).toBe('#ff0000');
  });

  it('should expand a 3-digit shorthand into a 6-digit hex', () => {
    expect(normalizeHex('#f00')).toBe('#ff0000');
  });
});
