// types
import { EffectType } from 'types/design/enums';

// utils
import { isEffectSupported } from '../isEffectSupported';

describe('isEffectSupported', () => {
  it('should support only the shadows and the layer blur', () => {
    expect(isEffectSupported(EffectType.innerShadow)).toBe(true);
    expect(isEffectSupported(EffectType.dropShadow)).toBe(true);
    expect(isEffectSupported(EffectType.layerBlur)).toBe(true);
    expect(isEffectSupported(EffectType.backgroundBlur)).toBe(false);
    expect(isEffectSupported(EffectType.shader)).toBe(false);
  });
});
