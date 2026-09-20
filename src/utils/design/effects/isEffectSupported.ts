// types
import { EffectType } from 'types/design/enums';

export const isEffectSupported = (type: EffectType): boolean =>
  type === EffectType.innerShadow ||
  type === EffectType.dropShadow ||
  type === EffectType.layerBlur ||
  type === EffectType.backgroundBlur ||
  type === EffectType.noise ||
  type === EffectType.texture;
