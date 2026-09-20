// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';
import { getEffectTexture } from '../getEffectTexture';

describe('getEffectTexture', () => {
  it('should read the size, radius and clip flag of a texture with their defaults', () => {
    // result
    expect(getEffectTexture(createEffect(EffectType.texture))).toEqual({ clipToShape: false, radius: 4, size: 4 });
    expect(getEffectTexture({ ...createEffect(EffectType.texture), clipToShape: true, noiseSize: 25, radius: 26.6 })).toEqual({
      clipToShape: true,
      radius: 26.6,
      size: 25,
    });
  });

  it('should fall back to the defaults when the effect has none of the texture fields', () => {
    // result
    expect(getEffectTexture({ ...createEffect(EffectType.noise), noiseSize: undefined })).toEqual({
      clipToShape: false,
      radius: 4,
      size: 4,
    });
  });
});
