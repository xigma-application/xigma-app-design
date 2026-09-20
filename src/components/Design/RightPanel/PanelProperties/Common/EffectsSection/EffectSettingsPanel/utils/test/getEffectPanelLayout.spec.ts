// types
import { EffectBlurType, EffectNoiseType, EffectType } from 'types/design/enums';

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

  it('should lay a background blur out like a layer blur', () => {
    // action
    const layout = getEffectPanelLayout(createEffect(EffectType.backgroundBlur));

    // result
    expect(layout.fields.map(({ key }) => key)).toEqual(['blur']);
    expect(layout).toMatchObject({ hasBlendMode: false, hasBlurModeToggle: true, hasColor: false });
  });

  it('should show the noise size, density and color with the blend mode and the Mono / Duo / Multi toggle for a noise', () => {
    // action
    const layout = getEffectPanelLayout(createEffect(EffectType.noise));

    // result
    expect(layout.fields.map(({ ariaKey, key }) => ariaKey ?? key)).toEqual(['noiseSize', 'noiseSizeY', 'density']);
    expect(layout.fields[1].isReadOnly).toBe(true);
    expect(layout).toMatchObject({ hasBlendMode: true, hasBlurModeToggle: false, hasColor: true, hasNoiseTypeToggle: true });
  });

  it('should hide the color row and add an Opacity field for a multi noise, whose colors come from the noise itself', () => {
    // result
    expect(
      getEffectPanelLayout({ ...createEffect(EffectType.noise), noiseType: EffectNoiseType.multi }).fields.map(({ key }) => key),
    ).toEqual(['noiseSize', 'noiseSize', 'density', 'opacity']);
    expect(getEffectPanelLayout({ ...createEffect(EffectType.noise), noiseType: EffectNoiseType.multi }).hasColor).toBe(false);
    expect(getEffectPanelLayout({ ...createEffect(EffectType.noise), noiseType: EffectNoiseType.duo }).hasColor).toBe(true);
  });

  it('should add the second color row only for a duo noise', () => {
    // result
    expect(getEffectPanelLayout(createEffect(EffectType.noise)).hasSecondaryColor).toBe(false);
    expect(getEffectPanelLayout({ ...createEffect(EffectType.noise), noiseType: EffectNoiseType.duo }).hasSecondaryColor).toBe(true);
    expect(getEffectPanelLayout(createEffect(EffectType.dropShadow)).hasSecondaryColor).toBe(false);
  });

  it('should give a glass only the glass controls', () => {
    // action
    const layout = getEffectPanelLayout(createEffect(EffectType.glass));

    // result
    expect(layout.fields).toEqual([]);
    expect(layout).toMatchObject({ hasBlendMode: false, hasClipToShape: false, hasColor: false, hasGlassControls: true });
  });

  it('should give a texture the size and radius fields and the Clip to shape checkbox, without blend mode or color', () => {
    // action
    const layout = getEffectPanelLayout(createEffect(EffectType.texture));

    // result
    expect(layout.fields.map(({ key }) => key)).toEqual(['noiseSize', 'noiseSize', 'radius']);
    expect(layout).toMatchObject({ hasBlendMode: false, hasClipToShape: true, hasColor: false, hasNoiseTypeToggle: false });
  });
});
