// types
import { EffectType } from 'types/design/enums';

// utils
import { getEffectPanelLayout } from '../getEffectPanelLayout';

describe('getEffectPanelLayout', () => {
  it('should show position, blur, spread, color and the blend mode for a shadow', () => {
    // action
    const layout = getEffectPanelLayout(EffectType.dropShadow);

    // result
    expect(layout.fields.map(({ key }) => key)).toEqual(['x', 'y', 'blur', 'spread']);
    expect(layout).toMatchObject({ hasBlendMode: true, hasBlurModeToggle: false, hasColor: true });
  });

  it('should show only the blur field and the Uniform / Progressive toggle for a layer blur', () => {
    // action
    const layout = getEffectPanelLayout(EffectType.layerBlur);

    // result
    expect(layout.fields.map(({ key }) => key)).toEqual(['blur']);
    expect(layout).toMatchObject({ hasBlendMode: false, hasBlurModeToggle: true, hasColor: false });
  });
});
