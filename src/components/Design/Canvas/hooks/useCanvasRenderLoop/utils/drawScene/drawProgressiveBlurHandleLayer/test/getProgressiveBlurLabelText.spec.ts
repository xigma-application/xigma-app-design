// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getProgressiveBlurLabelText } from '../getProgressiveBlurLabelText';

describe('getProgressiveBlurLabelText', () => {
  it('should label the start and end with their blur values, rounded to two decimals', () => {
    // mock
    const effect = { ...createEffect(EffectType.layerBlur), blur: 4.256, startBlur: 1 };

    // result
    expect(getProgressiveBlurLabelText(effect, 'start')).toBe('Start 1');
    expect(getProgressiveBlurLabelText(effect, 'end')).toBe('End 4.26');
  });

  it('should default the start to 0', () => {
    // result
    expect(getProgressiveBlurLabelText(createEffect(EffectType.layerBlur), 'start')).toBe('Start 0');
  });
});
