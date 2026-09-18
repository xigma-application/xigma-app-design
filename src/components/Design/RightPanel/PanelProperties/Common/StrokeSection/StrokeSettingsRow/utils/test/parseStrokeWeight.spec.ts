// utils
import { parseStrokeWeight } from '../parseStrokeWeight';

describe('parseStrokeWeight', () => {
  it('should parse a plain number', () => {
    // result
    expect(parseStrokeWeight('4')).toBe(4);
  });

  it('should keep decimals and strip stray characters', () => {
    // result
    expect(parseStrokeWeight(' 2.5px ')).toBe(2.5);
  });

  it('should clamp to the allowed range', () => {
    // result
    expect(parseStrokeWeight('5000')).toBe(1000);
    expect(parseStrokeWeight('-3')).toBe(3);
  });

  it('should return null when there is nothing numeric', () => {
    // result
    expect(parseStrokeWeight('abc')).toBeNull();
    expect(parseStrokeWeight('')).toBeNull();
  });
});
