import { getThumbOffset } from '../getThumbOffset';

describe('getThumbOffset', () => {
  it('should place the thumb exactly at the left edge for a 0 fraction', () => {
    expect(getThumbOffset(0)).toBe('0%');
  });

  it('should place the thumb exactly at the right edge for a 1 fraction', () => {
    expect(getThumbOffset(1)).toBe('100%');
  });

  it('should place the thumb at the matching percentage for a fraction in between', () => {
    expect(getThumbOffset(0.25)).toBe('25%');
  });
});
