// utils
import { parseArcValue } from '../parseArcValue';

describe('parseArcValue', () => {
  it('should read a number typed with or without its unit', () => {
    // result
    expect(parseArcValue(' 45° ')).toBe(45);
    expect(parseArcValue('-12.5%')).toBe(-12.5);
  });

  it('should reject empty or non-numeric input', () => {
    // result
    expect(parseArcValue('abc')).toBeNull();
    expect(parseArcValue('1-2')).toBeNull();
  });
});
