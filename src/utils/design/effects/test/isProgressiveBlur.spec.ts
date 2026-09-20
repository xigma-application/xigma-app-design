// types
import { EffectBlurType, EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';
import { isProgressiveBlur } from '../isProgressiveBlur';

describe('isProgressiveBlur', () => {
  it('should be true only for a layer or background blur set to progressive', () => {
    // mock
    const layerBlur = createEffect(EffectType.layerBlur);

    // result
    expect(isProgressiveBlur({ ...layerBlur, blurType: EffectBlurType.progressive })).toBe(true);
    expect(isProgressiveBlur({ ...layerBlur, blurType: EffectBlurType.uniform })).toBe(false);
    expect(isProgressiveBlur({ ...createEffect(EffectType.backgroundBlur), blurType: EffectBlurType.progressive })).toBe(true);
    expect(isProgressiveBlur(layerBlur)).toBe(false);
    expect(isProgressiveBlur({ ...createEffect(EffectType.dropShadow), blurType: EffectBlurType.progressive })).toBe(false);
    expect(isProgressiveBlur(undefined)).toBe(false);
  });
});
