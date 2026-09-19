// utils
import { getBrushCategoryId } from '../getBrushCategoryId';

describe('getBrushCategoryId', () => {
  it('should find the stretch category for one of its brushes', () => {
    expect(getBrushCategoryId('heist')).toBe('stretch');
  });

  it('should find the scatter category for one of its brushes', () => {
    expect(getBrushCategoryId('bubblegum')).toBe('scatter');
  });

  it('should return undefined for an unknown brush id', () => {
    expect(getBrushCategoryId('unknown')).toBeUndefined();
  });
});
