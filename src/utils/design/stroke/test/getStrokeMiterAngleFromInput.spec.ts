// utils
import { getStrokeMiterAngleFromInput } from '../getStrokeMiterAngleFromInput';

describe('getStrokeMiterAngleFromInput', () => {
  it('should parse a degree string and round it to two decimals', () => {
    expect(getStrokeMiterAngleFromInput('28.96°')).toBe(28.96);
    expect(getStrokeMiterAngleFromInput('45.678')).toBe(45.68);
  });

  it('should clamp to the 7.17-180 range', () => {
    expect(getStrokeMiterAngleFromInput('1')).toBe(7.17);
    expect(getStrokeMiterAngleFromInput('999°')).toBe(180);
  });

  it('should return undefined for text that is not a number', () => {
    expect(getStrokeMiterAngleFromInput('abc')).toBeUndefined();
    expect(getStrokeMiterAngleFromInput('')).toBeUndefined();
  });
});
