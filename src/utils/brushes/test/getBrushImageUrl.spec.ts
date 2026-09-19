// utils
import { getBrushImageUrl } from '../getBrushImageUrl';

describe('getBrushImageUrl', () => {
  it('should resolve a known brush image file to a url', () => {
    expect(getBrushImageUrl('stretch/heist.png')).toContain('heist');
  });

  it('should return an empty string for an unknown file', () => {
    expect(getBrushImageUrl('stretch/missing.png')).toBe('');
  });
});
