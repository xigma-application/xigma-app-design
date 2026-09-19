// types
import { BlendMode, EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';

describe('createEffect', () => {
  it('should create a shadow with the default offset, blur, spread, color and opacity', () => {
    expect(createEffect(EffectType.innerShadow)).toEqual({
      blendMode: BlendMode.normal,
      blur: 4,
      color: '#000000',
      opacity: 25,
      spread: 0,
      type: EffectType.innerShadow,
      x: 0,
      y: 4,
    });
  });

  it('should keep the requested type', () => {
    expect(createEffect(EffectType.dropShadow).type).toBe(EffectType.dropShadow);
  });
});
