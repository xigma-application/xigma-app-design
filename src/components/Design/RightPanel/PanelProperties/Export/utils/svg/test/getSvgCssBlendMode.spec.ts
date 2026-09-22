// types
import { BlendMode } from 'types/design/enums';

// utils
import { getSvgCssBlendMode } from '../getSvgCssBlendMode';

describe('getSvgCssBlendMode', () => {
  it('should return null for undefined, normal and passThrough (no wrapping needed)', () => {
    expect(getSvgCssBlendMode(undefined)).toBeNull();
    expect(getSvgCssBlendMode(BlendMode.normal)).toBeNull();
    expect(getSvgCssBlendMode(BlendMode.passThrough)).toBeNull();
  });

  it('should return null for plusDarker/plusLighter (no CSS mix-blend-mode equivalent)', () => {
    expect(getSvgCssBlendMode(BlendMode.plusDarker)).toBeNull();
    expect(getSvgCssBlendMode(BlendMode.plusLighter)).toBeNull();
  });

  it('should translate every supported blend mode to its CSS mix-blend-mode keyword', () => {
    expect(getSvgCssBlendMode(BlendMode.multiply)).toBe('multiply');
    expect(getSvgCssBlendMode(BlendMode.screen)).toBe('screen');
    expect(getSvgCssBlendMode(BlendMode.overlay)).toBe('overlay');
    expect(getSvgCssBlendMode(BlendMode.darken)).toBe('darken');
    expect(getSvgCssBlendMode(BlendMode.lighten)).toBe('lighten');
    expect(getSvgCssBlendMode(BlendMode.colorDodge)).toBe('color-dodge');
    expect(getSvgCssBlendMode(BlendMode.colorBurn)).toBe('color-burn');
    expect(getSvgCssBlendMode(BlendMode.hardLight)).toBe('hard-light');
    expect(getSvgCssBlendMode(BlendMode.softLight)).toBe('soft-light');
    expect(getSvgCssBlendMode(BlendMode.difference)).toBe('difference');
    expect(getSvgCssBlendMode(BlendMode.exclusion)).toBe('exclusion');
    expect(getSvgCssBlendMode(BlendMode.hue)).toBe('hue');
    expect(getSvgCssBlendMode(BlendMode.saturation)).toBe('saturation');
    expect(getSvgCssBlendMode(BlendMode.color)).toBe('color');
    expect(getSvgCssBlendMode(BlendMode.luminosity)).toBe('luminosity');
  });
});
