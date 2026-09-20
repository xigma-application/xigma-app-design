// utils
import { getGlassLightRotation } from '../getGlassLightRotation';

describe('getGlassLightRotation', () => {
  it('should turn the icon, which shines to the right, so that it shines toward the glass', () => {
    // result
    expect(getGlassLightRotation(0)).toBe(90);
    expect(getGlassLightRotation(-90)).toBe(0);
    expect(getGlassLightRotation(-58)).toBe(32);
    expect(getGlassLightRotation(90)).toBe(180);
  });
});
