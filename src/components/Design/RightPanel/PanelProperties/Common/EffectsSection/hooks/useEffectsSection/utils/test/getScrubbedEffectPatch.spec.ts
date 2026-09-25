// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getScrubbedEffectPatch } from '../getScrubbedEffectPatch';

describe('getScrubbedEffectPatch', () => {
  it('should patch the field with the own value moved by the scrub delta, clamped to the minimum', () => {
    // mock
    const base = { ...createEffect(EffectType.dropShadow), blur: 4 };

    // result
    expect(getScrubbedEffectPatch({ ...base, blur: 10 }, base, 'blur', 0, 6)).toEqual({ blur: 12 });
    expect(getScrubbedEffectPatch({ ...base, blur: 1 }, base, 'blur', 0, 0)).toEqual({ blur: 0 });
  });

  it('should patch nothing when the value is not a number', () => {
    // mock
    const base = createEffect(EffectType.dropShadow);

    // result
    expect(getScrubbedEffectPatch({ ...base, x: Number.NaN }, base, 'x', 0, 1)).toEqual({});
  });
});
