// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getBoxEffectMargin } from '../getBoxEffectMargin';
import { getDropShadowMargin } from '../getDropShadowMargin';

const build = (overrides: Partial<TEffect>): TEffect => ({ ...createEffect(EffectType.dropShadow), ...overrides });

describe('getDropShadowMargin', () => {
  it('should add the largest offset and a positive spread to the blur margin', () => {
    // result
    expect(getDropShadowMargin(build({ blur: 4, spread: 3, x: -10, y: 6 }))).toBe(getBoxEffectMargin(4) + 13);
  });

  it('should ignore a negative spread', () => {
    // result
    expect(getDropShadowMargin(build({ blur: 4, spread: -5, x: 0, y: 0 }))).toBe(getBoxEffectMargin(4));
  });
});
