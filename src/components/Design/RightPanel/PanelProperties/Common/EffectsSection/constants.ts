// @xigma
import { TIconProps } from '@xigma/components';

// others
import { EffectType } from 'types/design/enums';
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.effectsSection`;

export const EFFECT_ICONS: Record<EffectType, TIconProps['name']> = {
  [EffectType.backgroundBlur]: 'BackgroundBlur',
  [EffectType.dropShadow]: 'DropShadow',
  [EffectType.glass]: 'Glass',
  [EffectType.innerShadow]: 'InnerShadow',
  [EffectType.layerBlur]: 'LayerBlur',
  [EffectType.noise]: 'Noise',
  [EffectType.shader]: 'Shader',
  [EffectType.texture]: 'Texture',
};

export const EFFECT_MENU_TYPES: EffectType[] = [
  EffectType.innerShadow,
  EffectType.dropShadow,
  EffectType.layerBlur,
  EffectType.backgroundBlur,
  EffectType.noise,
  EffectType.texture,
  EffectType.glass,
];

export const EFFECT_MENU_SEPARATED_TYPE = EffectType.shader;

export const EFFECT_SCRUB_LIMIT = 100000;

export const EFFECT_NUMBER_FIELDS = [
  { adornmentLabel: 'X', icon: undefined, key: 'x', labelKey: 'position', min: Number.NEGATIVE_INFINITY },
  { adornmentLabel: 'Y', icon: undefined, key: 'y', labelKey: undefined, min: Number.NEGATIVE_INFINITY },
  { adornmentLabel: undefined, icon: 'LayerBlur', key: 'blur', labelKey: 'blur', min: 0 },
  { adornmentLabel: undefined, icon: 'Spread', key: 'spread', labelKey: 'spread', min: Number.NEGATIVE_INFINITY },
] as const;
