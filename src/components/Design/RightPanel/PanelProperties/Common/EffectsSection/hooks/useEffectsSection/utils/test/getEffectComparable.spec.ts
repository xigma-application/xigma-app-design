// types
import { BlendMode, EffectBlurType, EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getEffectComparable } from '../getEffectComparable';

describe('getEffectComparable', () => {
  it('should fill the defaults of an effect so equal effects compare equal', () => {
    // mock
    const effect = { ...createEffect(EffectType.layerBlur), blendMode: undefined, blurType: undefined, visible: undefined };

    // before
    const result = getEffectComparable(effect);

    // result
    expect(result).toMatchObject({ blendMode: BlendMode.normal, blurType: EffectBlurType.uniform, clipToShape: false, visible: true });
  });

  it('should keep a hidden effect hidden and read a texture size from its noise size', () => {
    // mock
    const effect = { ...createEffect(EffectType.texture), noiseSize: 7, visible: false };

    // before
    const result = getEffectComparable(effect);

    // result
    expect(result).toMatchObject({ noiseSize: 7, type: EffectType.texture, visible: false });
  });
});
