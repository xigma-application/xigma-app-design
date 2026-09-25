// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getEffectsWithVisibility } from '../getEffectsWithVisibility';

describe('getEffectsWithVisibility', () => {
  it('should hide a visible effect and show a hidden one', () => {
    // mock
    const effect = createEffect(EffectType.dropShadow);

    // result
    expect(getEffectsWithVisibility([effect], 0, false)[0].visible).toBe(false);
    expect(getEffectsWithVisibility([{ ...effect, visible: false }], 0, true)[0].visible).toBeUndefined();
  });
});
