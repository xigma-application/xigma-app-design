// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from '../createEffect';
import { getProgressiveBlur } from '../getProgressiveBlur';

describe('getProgressiveBlur', () => {
  it('should default to a vertical line from the top center to the bottom center, from 0 to the effect blur', () => {
    // result
    expect(getProgressiveBlur(createEffect(EffectType.layerBlur))).toEqual({
      end: { x: 0.5, y: 1 },
      endBlur: 4,
      start: { x: 0.5, y: 0 },
      startBlur: 0,
    });
  });

  it('should use the stored points and start blur', () => {
    // mock
    const effect = { ...createEffect(EffectType.layerBlur), blur: 10, end: { x: 1, y: 1 }, start: { x: 0, y: 0.2 }, startBlur: 3 };

    // result
    expect(getProgressiveBlur(effect)).toEqual({ end: { x: 1, y: 1 }, endBlur: 10, start: { x: 0, y: 0.2 }, startBlur: 3 });
  });
});
