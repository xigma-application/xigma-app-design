// utils
import { isLightColor } from '../isLightColor';

describe('isLightColor', () => {
  it.each(['#FFFFFF', '#F5F5F5', '#D9D9D9', '#FFFF00'])('should treat %s as light', (hex) => {
    // result
    expect(isLightColor(hex)).toBe(true);
  });

  it.each(['#000000', '#444444', '#535353', '#0000FF'])('should treat %s as dark', (hex) => {
    // result
    expect(isLightColor(hex)).toBe(false);
  });
});
