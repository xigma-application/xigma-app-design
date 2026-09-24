// types
import { EffectBlurType, EffectNoiseType, EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getSharedEffectPanelLayout } from '../getSharedEffectPanelLayout';

describe('getSharedEffectPanelLayout', () => {
  it('should keep only the fields every blur mode has for a mixed uniform and progressive blur', () => {
    // mock
    const blur = createEffect(EffectType.layerBlur);

    // action
    const layout = getSharedEffectPanelLayout([blur, { ...blur, blurType: EffectBlurType.progressive }]);

    // result
    expect(layout.fields.map(({ key }) => key)).toEqual(['blur']);
    expect(layout.hasBlurModeToggle).toBe(true);
  });

  it('should hide the colors for a mixed mono and multi noise, and the secondary color unless every noise is duo', () => {
    // mock
    const noise = createEffect(EffectType.noise);

    // action
    const monoMulti = getSharedEffectPanelLayout([noise, { ...noise, noiseType: EffectNoiseType.multi }]);
    const monoDuo = getSharedEffectPanelLayout([noise, { ...noise, noiseType: EffectNoiseType.duo }]);

    // result
    expect(monoMulti).toMatchObject({ hasColor: false, hasSecondaryColor: false });
    expect(monoMulti.fields.map(({ key }) => key)).not.toContain('opacity');
    expect(monoDuo).toMatchObject({ hasColor: true, hasSecondaryColor: false });
  });
});
