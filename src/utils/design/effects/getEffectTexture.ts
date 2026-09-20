// others
import { DEFAULT_TEXTURE_RADIUS, DEFAULT_TEXTURE_SIZE } from 'constant/effect';

// types
import { TEffect } from 'types/design/types';

export type TEffectTexture = {
  clipToShape: boolean;
  radius: number;
  size: number;
};

export const getEffectTexture = (effect: TEffect): TEffectTexture => ({
  clipToShape: effect.clipToShape ?? false,
  radius: effect.radius ?? DEFAULT_TEXTURE_RADIUS,
  size: effect.noiseSize ?? DEFAULT_TEXTURE_SIZE,
});
