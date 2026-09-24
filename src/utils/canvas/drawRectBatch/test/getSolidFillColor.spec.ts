// utils
import { getSolidFillColor } from '../getSolidFillColor';

describe('getSolidFillColor', () => {
  it('should convert a hex color to normalized rgb', () => {
    // before
    const rgb = getSolidFillColor('#ff0000');

    // result
    expect(rgb).toEqual([1, 0, 0]);
  });

  it('should return the very same array for a repeated color', () => {
    // before
    const first = getSolidFillColor('#00ff00');
    const second = getSolidFillColor('#00ff00');

    // result
    expect(second).toBe(first);
  });
});
