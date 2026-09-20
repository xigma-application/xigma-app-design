// types
import { EffectType } from 'types/design/enums';

// utils
import { isEffectSupported } from '../isEffectSupported';

describe('isEffectSupported', () => {
  it('should support the shadows, the blurs, the noise and the texture', () => {
    expect(isEffectSupported(EffectType.innerShadow)).toBe(true);
    expect(isEffectSupported(EffectType.dropShadow)).toBe(true);
    expect(isEffectSupported(EffectType.layerBlur)).toBe(true);
    expect(isEffectSupported(EffectType.backgroundBlur)).toBe(true);
    expect(isEffectSupported(EffectType.noise)).toBe(true);
    expect(isEffectSupported(EffectType.texture)).toBe(true);
    expect(isEffectSupported(EffectType.glass)).toBe(false);
    expect(isEffectSupported(EffectType.shader)).toBe(false);
  });
});
