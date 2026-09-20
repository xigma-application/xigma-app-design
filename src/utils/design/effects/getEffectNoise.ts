// others
import { DEFAULT_NOISE_DENSITY, DEFAULT_NOISE_SECONDARY_COLOR, DEFAULT_NOISE_SECONDARY_OPACITY, DEFAULT_NOISE_SIZE } from 'constant/effect';

// types
import { EffectNoiseType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

export type TEffectNoise = {
  density: number;
  noiseSize: number;
  noiseType: EffectNoiseType;
  secondaryColor: string;
  secondaryOpacity: number;
};

export const getEffectNoise = (effect: TEffect): TEffectNoise => ({
  density: effect.density ?? DEFAULT_NOISE_DENSITY,
  noiseSize: effect.noiseSize ?? DEFAULT_NOISE_SIZE,
  noiseType: effect.noiseType ?? EffectNoiseType.mono,
  secondaryColor: effect.secondaryColor ?? DEFAULT_NOISE_SECONDARY_COLOR,
  secondaryOpacity: effect.secondaryOpacity ?? DEFAULT_NOISE_SECONDARY_OPACITY,
});
