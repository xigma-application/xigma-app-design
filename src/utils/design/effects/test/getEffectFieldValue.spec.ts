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
});
