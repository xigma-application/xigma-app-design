// utils
import { getStrokeBrushCategory } from '../getStrokeBrushCategory';

describe('getStrokeBrushCategory', () => {
  it('should find the category and index of a brush', () => {
    expect(getStrokeBrushCategory('heist')).toEqual({ category: 'stretch', index: 0 });
    expect(getStrokeBrushCategory('bubblegum')).toEqual({ category: 'scatter', index: 0 });
  });

  it('should return undefined for an unknown brush', () => {
    expect(getStrokeBrushCategory('nope')).toBeUndefined();
  });
});
