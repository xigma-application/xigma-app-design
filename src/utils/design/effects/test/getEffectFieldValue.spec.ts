// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';
import { getEffectFieldValue } from '../getEffectFieldValue';

describe('getEffectFieldValue', () => {
  it('should read a plain numeric field', () => {
    // result
    expect(getEffectFieldValue({ ...createEffect(EffectType.dropShadow), y: 9 }, 'y')).toBe(9);
  });

  it('should fall back to 0 for an unset start blur', () => {
    // result
    expect(getEffectFieldValue(createEffect(EffectType.layerBlur), 'startBlur')).toBe(0);
    expect(getEffectFieldValue({ ...createEffect(EffectType.layerBlur), startBlur: 5 }, 'startBlur')).toBe(5);
  });

  it('should fall back to the noise defaults', () => {
    // result
    expect(getEffectFieldValue(createEffect(EffectType.noise), 'noiseSize')).toBe(0.5);
    expect(getEffectFieldValue(createEffect(EffectType.noise), 'density')).toBe(100);
    expect(getEffectFieldValue({ ...createEffect(EffectType.noise), density: 30 }, 'density')).toBe(30);
  });
});
