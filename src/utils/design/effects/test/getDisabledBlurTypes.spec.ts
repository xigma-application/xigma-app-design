// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';
import { getDisabledBlurTypes } from '../getDisabledBlurTypes';

describe('getDisabledBlurTypes', () => {
  it('should disable both blurs once a layer or background blur exists', () => {
    // result
    expect(getDisabledBlurTypes([createEffect(EffectType.layerBlur)])).toEqual([EffectType.layerBlur, EffectType.backgroundBlur]);
    expect(getDisabledBlurTypes([createEffect(EffectType.dropShadow), createEffect(EffectType.backgroundBlur)])).toEqual([
      EffectType.layerBlur,
      EffectType.backgroundBlur,
    ]);
  });

  it('should disable nothing without a blur, or when the only blur is the effect being edited', () => {
    // result
    expect(getDisabledBlurTypes([createEffect(EffectType.dropShadow)])).toEqual([]);
    expect(getDisabledBlurTypes([createEffect(EffectType.layerBlur)], 0)).toEqual([]);
    expect(getDisabledBlurTypes([createEffect(EffectType.layerBlur), createEffect(EffectType.dropShadow)], 1)).toEqual([
      EffectType.layerBlur,
      EffectType.backgroundBlur,
    ]);
  });
});
