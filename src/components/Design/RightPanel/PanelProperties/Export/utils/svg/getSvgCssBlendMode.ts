// types
import { BlendMode } from 'types/design/enums';

const CSS_BLEND_MODE_BY_BLEND_MODE: Partial<Record<BlendMode, string>> = {
  [BlendMode.color]: 'color',
  [BlendMode.colorBurn]: 'color-burn',
  [BlendMode.colorDodge]: 'color-dodge',
  [BlendMode.darken]: 'darken',
  [BlendMode.difference]: 'difference',
  [BlendMode.exclusion]: 'exclusion',
  [BlendMode.hardLight]: 'hard-light',
  [BlendMode.hue]: 'hue',
  [BlendMode.lighten]: 'lighten',
  [BlendMode.luminosity]: 'luminosity',
  [BlendMode.multiply]: 'multiply',
  [BlendMode.overlay]: 'overlay',
  [BlendMode.saturation]: 'saturation',
  [BlendMode.screen]: 'screen',
  [BlendMode.softLight]: 'soft-light',
};

export const getSvgCssBlendMode = (blendMode: BlendMode | undefined): string | null =>
  blendMode ? (CSS_BLEND_MODE_BY_BLEND_MODE[blendMode] ?? null) : null;
