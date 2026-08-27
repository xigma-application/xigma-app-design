// utils
import { isValidHex } from '../isValidHex';

describe('isValidHex', () => {
  it('should accept a 6-digit hex with a leading #', () => {
    expect(isValidHex('#ff0000')).toBe(true);
  });

  it('should accept a 6-digit hex without a leading #', () => {
    expect(isValidHex('ff0000')).toBe(true);
  });

  it('should accept a 3-digit shorthand hex', () => {
    expect(isValidHex('#f00')).toBe(true);
  });

  it('should accept uppercase hex digits', () => {
    expect(isValidHex('#FF0000')).toBe(true);
  });

  it('should reject a value with the wrong digit count', () => {
    expect(isValidHex('#ff00')).toBe(false);
  });

  it('should reject a value with non-hex characters', () => {
    expect(isValidHex('#gg0000')).toBe(false);
  });
});
