// types
import { EffectType } from 'types/design/enums';

// utils
import { booleanShape } from './fixtures';
import { createEffect } from 'utils/design/effects/createEffect';
import { getBooleanEffectTextureKey } from '../getBooleanEffectTextureKey';

describe('getBooleanEffectTextureKey', () => {
  it('should change with the shape and with every effect setting that alters the texture', () => {
    // mock
    const effect = createEffect(EffectType.dropShadow);
    const key = getBooleanEffectTextureKey(EffectType.dropShadow, booleanShape, effect);

    // result
    expect(getBooleanEffectTextureKey(EffectType.dropShadow, { ...booleanShape, key: 8 }, effect)).not.toBe(key);
    expect(getBooleanEffectTextureKey(EffectType.innerShadow, booleanShape, effect)).not.toBe(key);
    expect(getBooleanEffectTextureKey(EffectType.dropShadow, booleanShape, { ...effect, blur: 9 })).not.toBe(key);
    expect(getBooleanEffectTextureKey(EffectType.dropShadow, booleanShape, { ...effect, x: 9 })).not.toBe(key);
    expect(getBooleanEffectTextureKey(EffectType.dropShadow, booleanShape, { ...effect, color: '#ff0000' })).not.toBe(key);
  });

  it('should ignore the opacity, which is applied when drawing', () => {
    // mock
    const effect = createEffect(EffectType.dropShadow);

    // action / result
    expect(getBooleanEffectTextureKey(EffectType.dropShadow, booleanShape, { ...effect, opacity: 5 })).toBe(
      getBooleanEffectTextureKey(EffectType.dropShadow, booleanShape, effect),
    );
  });
});
