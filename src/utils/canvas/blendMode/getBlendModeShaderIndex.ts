// types
import { BlendMode } from 'types/design/enums';

const BLEND_MODE_SHADER_INDEX: Record<BlendMode, number> = {
  [BlendMode.color]: 0,
  [BlendMode.colorBurn]: 1,
  [BlendMode.colorDodge]: 2,
  [BlendMode.darken]: 3,
  [BlendMode.difference]: 4,
  [BlendMode.exclusion]: 5,
  [BlendMode.hardLight]: 6,
  [BlendMode.hue]: 7,
  [BlendMode.lighten]: 8,
  [BlendMode.luminosity]: 9,
  [BlendMode.multiply]: 10,
  [BlendMode.normal]: 11,
  [BlendMode.overlay]: 12,
  [BlendMode.passThrough]: 11,
  [BlendMode.plusDarker]: 13,
  [BlendMode.plusLighter]: 14,
  [BlendMode.saturation]: 15,
  [BlendMode.screen]: 16,
  [BlendMode.softLight]: 17,
};

export const getBlendModeShaderIndex = (blendMode: BlendMode): number => BLEND_MODE_SHADER_INDEX[blendMode];
