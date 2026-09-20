// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';
import { getEffectGlass } from '../getEffectGlass';

describe('getEffectGlass', () => {
  it('should fall back to the glass defaults', () => {
    // result
    expect(getEffectGlass(createEffect(EffectType.glass))).toEqual({
      depth: 20,
      dispersion: 50,
      frost: 4,
      lightAngle: -45,
      lightIntensity: 80,
      refraction: 80,
      splay: 0,
    });
  });

  it('should read the values the effect stores, including a zero', () => {
    // result
    expect(getEffectGlass({ ...createEffect(EffectType.glass), frost: 0, lightAngle: -58, refraction: 10 })).toMatchObject({
      frost: 0,
      lightAngle: -58,
      refraction: 10,
    });
  });
});
