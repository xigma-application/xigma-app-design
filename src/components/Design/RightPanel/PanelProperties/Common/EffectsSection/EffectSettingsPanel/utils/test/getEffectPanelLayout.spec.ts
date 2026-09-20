// types
import { EffectBlurType, EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getEffectPanelLayout } from '../getEffectPanelLayout';

describe('getEffectPanelLayout', () => {
  it('should show position, blur, spread, color and the blend mode for a shadow', () => {
    // action
    const layout = getEffectPanelLayout(createEffect(EffectType.dropShadow));

    // result
    expect(layout.fields.map(({ key }) => key)).toEqual(['x', 'y', 'blur', 'spread']);
    expect(layout).toMatchObject({ hasBlendMode: true, hasBlurModeToggle: false, hasColor: true });
  });

  it('should show only the blur field and the Uniform / Progressive toggle for a layer blur', () => {
    // action
    const layout = getEffectPanelLayout(createEffect(EffectType.layerBlur));

    // result
    expect(layout.fields.map(({ key }) => key)).toEqual(['blur']);
    expect(layout).toMatchObject({ hasBlendMode: false, hasBlurModeToggle: true, hasColor: false });
  });

  it('should show Start and End blur fields for a progressive layer blur', () => {
    // action
    const layout = getEffectPanelLayout({ ...createEffect(EffectType.layerBlur), blurType: EffectBlurType.progressive });

    // result
    expect(layout.fields.map(({ key, labelKey }) => [key, labelKey])).toEqual([
      ['startBlur', 'start'],
      ['blur', 'end'],
    ]);
    expect(layout.hasBlurModeToggle).toBe(true);
  });
});
