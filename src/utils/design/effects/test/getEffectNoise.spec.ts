// types
import { EffectNoiseType, EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';
import { getEffectNoise } from '../getEffectNoise';

describe('getEffectNoise', () => {
  it('should default to mono noise of size 0.5 at full density', () => {
    // result
    expect(getEffectNoise(createEffect(EffectType.noise))).toEqual({ density: 100, noiseSize: 0.5, noiseType: EffectNoiseType.mono });
  });

  it('should use the stored values', () => {
    // result
    expect(getEffectNoise({ ...createEffect(EffectType.noise), density: 40, noiseSize: 3, noiseType: EffectNoiseType.duo })).toEqual({
      density: 40,
      noiseSize: 3,
      noiseType: EffectNoiseType.duo,
    });
  });
});
