// types
import { EffectBlurType, EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';
import { isProgressiveLayerBlur } from '../isProgressiveLayerBlur';

describe('isProgressiveLayerBlur', () => {
  it('should be true only for a layer blur set to progressive', () => {
    // mock
    const layerBlur = createEffect(EffectType.layerBlur);

    // result
    expect(isProgressiveLayerBlur({ ...layerBlur, blurType: EffectBlurType.progressive })).toBe(true);
    expect(isProgressiveLayerBlur({ ...layerBlur, blurType: EffectBlurType.uniform })).toBe(false);
    expect(isProgressiveLayerBlur(layerBlur)).toBe(false);
    expect(isProgressiveLayerBlur({ ...createEffect(EffectType.dropShadow), blurType: EffectBlurType.progressive })).toBe(false);
    expect(isProgressiveLayerBlur(undefined)).toBe(false);
  });
});
