// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

// utils
import { hasVectorShapeEffects } from '../hasVectorShapeEffects';

const effect = (type: EffectType, visible?: boolean): TEffect => ({ type, visible }) as TEffect;

describe('hasVectorShapeEffects', () => {
  it('should find a visible shadow or noise', () => {
    // result
    expect(hasVectorShapeEffects({ effects: [effect(EffectType.dropShadow)] })).toBe(true);
    expect(hasVectorShapeEffects({ effects: [effect(EffectType.noise, true)] })).toBe(true);
  });

  it('should ignore hidden effects, blurs and a vector without effects', () => {
    // result
    expect(hasVectorShapeEffects({ effects: [effect(EffectType.innerShadow, false), effect(EffectType.layerBlur)] })).toBe(false);
    expect(hasVectorShapeEffects({})).toBe(false);
  });
});
