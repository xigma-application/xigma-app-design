// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';
import { toggleEffectVisibility } from '../toggleEffectVisibility';

describe('toggleEffectVisibility', () => {
  it('should hide only the effect at the index', () => {
    // Step 1: Two visible effects
    const effects = [createEffect(EffectType.innerShadow), createEffect(EffectType.dropShadow)];

    // Step 2: Hide the second one
    const result = toggleEffectVisibility(effects, 1);

    // Step 3: Assert
    expect(result[0].visible).toBeUndefined();
    expect(result[1].visible).toBe(false);
  });

  it('should show a hidden effect again', () => {
    // Step 1: A hidden effect
    const effects = [{ ...createEffect(EffectType.innerShadow), visible: false }];

    // Step 2: Toggle it
    const result = toggleEffectVisibility(effects, 0);

    // Step 3: Assert
    expect(result[0].visible).toBeUndefined();
  });
});
