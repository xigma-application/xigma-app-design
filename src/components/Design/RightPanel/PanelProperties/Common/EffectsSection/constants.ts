// @xigma
import { TIconProps } from '@xigma/components';

// others
import { EffectType } from './enums';
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.effectsSection`;

export const EFFECT_MENU_OPTIONS: { icon: TIconProps['name']; type: EffectType }[] = [
  { icon: 'InnerShadow', type: EffectType.innerShadow },
  { icon: 'DropShadow', type: EffectType.dropShadow },
  { icon: 'LayerBlur', type: EffectType.layerBlur },
  { icon: 'BackgroundBlur', type: EffectType.backgroundBlur },
  { icon: 'Noise', type: EffectType.noise },
  { icon: 'Texture', type: EffectType.texture },
  { icon: 'Glass', type: EffectType.glass },
];

export const SHADER_MENU_OPTION: { icon: TIconProps['name']; type: EffectType } = { icon: 'Shader', type: EffectType.shader };
