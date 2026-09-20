// types
import { EffectType } from 'types/design/enums';

// utils
import { isEffectSupported } from '../isEffectSupported';

describe('isEffectSupported', () => {
  it('should support the shadows, the blurs, the noise, the texture and the glass', () => {
    expect(isEffectSupported(EffectType.innerShadow)).toBe(true);
    expect(isEffectSupported(EffectType.dropShadow)).toBe(true);
    expect(isEffectSupported(EffectType.layerBlur)).toBe(true);
    expect(isEffectSupported(EffectType.backgroundBlur)).toBe(true);
    expect(isEffectSupported(EffectType.noise)).toBe(true);
    expect(isEffectSupported(EffectType.texture)).toBe(true);
    expect(isEffectSupported(EffectType.glass)).toBe(true);
    expect(isEffectSupported(EffectType.shader)).toBe(false);
  });
});
