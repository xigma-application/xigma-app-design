// utils
import { getAutoLayoutChildBaselineOffset } from '../getAutoLayoutChildBaselineOffset';
import { getTextBaselineOffset } from '../getTextBaselineOffset';

describe('getAutoLayoutChildBaselineOffset', () => {
  it('should use the text ascent formula when the child has a fontSize', () => {
    expect(getAutoLayoutChildBaselineOffset({ fontSize: 16, height: 40, id: 'text-1', width: 100 })).toBe(getTextBaselineOffset(16));
  });

  it('should fall back to the full height when the child has no fontSize', () => {
    expect(getAutoLayoutChildBaselineOffset({ height: 24, id: 'icon-1', width: 24 })).toBe(24);
  });
});
