// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getEffectsWithScrub } from '../getEffectsWithScrub';

describe('getEffectsWithScrub', () => {
  it('should scrub a node its own value by the delta from the shown effect', () => {
    // mock
    const base = { ...createEffect(EffectType.dropShadow), x: 2 };
    const own = [{ ...base, x: 10 }, base];

    // before
    const [scrubbed, untouched] = getEffectsWithScrub(own, 0, base, 'x', Number.NEGATIVE_INFINITY, 5);

    // result
    expect(scrubbed.x).toBe(13);
    expect(untouched).toBe(base);
  });
});
