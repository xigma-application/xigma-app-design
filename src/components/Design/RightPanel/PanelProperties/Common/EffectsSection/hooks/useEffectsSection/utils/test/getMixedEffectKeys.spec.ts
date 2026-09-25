// types
import { EffectBlurType, EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getMixedEffectKeys } from '../getMixedEffectKeys';

describe('getMixedEffectKeys', () => {
  it('should report only the keys whose effective values differ, treating defaults as set', () => {
    // mock
    const blur = createEffect(EffectType.layerBlur);

    // before
    const keys = getMixedEffectKeys([blur, { ...blur, blur: blur.blur + 2, blurType: EffectBlurType.uniform }]);

    // result
    expect([...keys]).toEqual(['blur']);
  });
});
