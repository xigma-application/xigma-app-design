// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { handleEffectNumberScrub } from '../handleEffectNumberScrub';

describe('handleEffectNumberScrub', () => {
  it('should commit the scrubbed value rounded to two decimals', () => {
    // Step 1: Prepare
    const effect = createEffect(EffectType.innerShadow);
    const onChange = vi.fn();

    // Step 2: Scrub X
    handleEffectNumberScrub(7.456, 'x', Number.NEGATIVE_INFINITY, effect, onChange);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ ...effect, x: 7.46 });
  });

  it('should clamp to the field minimum', () => {
    // Step 1: Prepare
    const effect = createEffect(EffectType.innerShadow);
    const onChange = vi.fn();

    // Step 2: Scrub blur below zero
    handleEffectNumberScrub(-5, 'blur', 0, effect, onChange);

    // Step 3: Assert
    expect(onChange).toHaveBeenCalledWith({ ...effect, blur: 0 });
  });
});
