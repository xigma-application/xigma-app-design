// types
import { ColorPickerTab } from '../../enums';

// utils
import { getColorPickerPreview } from '../getColorPickerPreview';

const STOPS = [
  { color: '#ffffff', id: 'a', opacity: 100, position: 0 },
  { color: '#000000', id: 'b', opacity: 100, position: 1 },
];
const VALUE = { alpha: 80, hex: '#ff0000' };

describe('getColorPickerPreview', () => {
  it('should build a gradient preview when the gradient tab is active', () => {
    // action
    const preview = getColorPickerPreview(ColorPickerTab.gradient, STOPS, 'gradient-linear', 0, VALUE);

    // result
    expect(preview.type).toBe('gradient');
    expect(preview).toHaveProperty('style');
  });

  it('should build a solid preview carrying the given value for the solid tab', () => {
    // action
    const preview = getColorPickerPreview(ColorPickerTab.solid, STOPS, 'gradient-linear', 0, VALUE);

    // result
    expect(preview).toEqual({ type: 'solid', value: VALUE });
  });

  it('should build a solid preview carrying the given value for the pattern tab too', () => {
    // action
    const preview = getColorPickerPreview(ColorPickerTab.pattern, STOPS, 'gradient-linear', 0, VALUE);

    // result
    expect(preview).toEqual({ type: 'solid', value: VALUE });
  });
});
