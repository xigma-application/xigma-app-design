// types
import { BlendMode } from './enums';

export const BLEND_MODE_GROUPS: readonly (readonly BlendMode[])[] = [
  [BlendMode.passThrough, BlendMode.normal],
  [BlendMode.darken, BlendMode.multiply, BlendMode.plusDarker, BlendMode.colorBurn],
  [BlendMode.lighten, BlendMode.screen, BlendMode.plusLighter, BlendMode.colorDodge],
  [BlendMode.overlay, BlendMode.softLight, BlendMode.hardLight],
  [BlendMode.difference, BlendMode.exclusion],
  [BlendMode.hue, BlendMode.saturation, BlendMode.color, BlendMode.luminosity],
];

export const FACE_BLEND_MODE_GROUPS: readonly (readonly BlendMode[])[] = BLEND_MODE_GROUPS.map((group) =>
  group.filter((blendMode) => blendMode !== BlendMode.passThrough),
);
