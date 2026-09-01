// utils
import { getThumbStyle } from '../getThumbStyle';

describe('getThumbStyle', () => {
  it('should map a vertical thumb to height and top percentages', () => {
    // action — quarter-size thumb, scrolled halfway
    const style = getThumbStyle('vertical', 0.25, 0.5);

    // result — top = 0.5 * (100 - 25) = 37.5
    expect(style).toEqual({ height: '25%', top: '37.5%' });
  });

  it('should map a horizontal thumb to width and left percentages', () => {
    // action
    const style = getThumbStyle('horizontal', 0.25, 0.5);

    // result
    expect(style).toEqual({ left: '37.5%', width: '25%' });
  });
});
