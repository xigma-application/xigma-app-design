// utils
import { getGradientPreviewStyle } from '../getGradientPreviewStyle';

const STOPS = [
  { color: '#ffffff', id: 'a', opacity: 100, position: 0 },
  { color: '#000000', id: 'b', opacity: 100, position: 1 },
];

describe('getGradientPreviewStyle', () => {
  it('should build a linear-gradient background pointing right by default (angle 0)', () => {
    // action
    const style = getGradientPreviewStyle(STOPS, 'gradient-linear');

    // result
    expect(style.background).toBe('linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)');
  });

  it('should rotate the linear-gradient css angle to match the given rotation angle', () => {
    // action
    const style = getGradientPreviewStyle(STOPS, 'gradient-linear', 90);

    // result — our 90deg (top-to-bottom) maps to CSS 180deg
    expect(style.background).toBe('linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)');
  });

  it('should build a farthest-corner radial-gradient background for the radial type, so it stays smooth all the way to the corners', () => {
    // action
    const style = getGradientPreviewStyle(STOPS, 'gradient-radial');

    // result
    expect(style.background).toBe('radial-gradient(circle farthest-corner, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)');
  });

  it('should build a conic-gradient background starting from the css angle matching the rotation angle', () => {
    // action
    const style = getGradientPreviewStyle(STOPS, 'gradient-angular');

    // result
    expect(style.background).toBe('conic-gradient(from 90deg, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)');
  });

  it('should build a farthest-side radial-gradient background for the diamond type, so the corners clamp to a flat color', () => {
    // action
    const style = getGradientPreviewStyle(STOPS, 'gradient-diamond');

    // result
    expect(style.background).toBe('radial-gradient(circle farthest-side, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)');
    expect(style.clipPath).toBeUndefined();
  });
});
