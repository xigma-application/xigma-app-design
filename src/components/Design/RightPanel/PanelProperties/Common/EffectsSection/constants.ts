// @xigma
import { TIconProps } from '@xigma/components';

// types
import { TEffectField, TEffectNumberField } from './types';

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

export const EFFECT_NUMBER_FIELDS: readonly TEffectField[] = [
  { adornmentLabel: 'X', icon: undefined, key: 'x', labelKey: 'position', min: Number.NEGATIVE_INFINITY },
  { adornmentLabel: 'Y', icon: undefined, key: 'y', labelKey: undefined, min: Number.NEGATIVE_INFINITY },
  { adornmentLabel: undefined, icon: 'LayerBlur', key: 'blur', labelKey: 'blur', min: 0 },
  { adornmentLabel: undefined, icon: 'Spread', key: 'spread', labelKey: 'spread', min: Number.NEGATIVE_INFINITY },
];

export const EFFECT_PROGRESSIVE_BLUR_FIELDS: readonly TEffectField[] = [
  { adornmentLabel: undefined, icon: 'LayerBlur', key: 'startBlur', labelKey: 'start', min: 0 },
  { adornmentLabel: undefined, icon: 'LayerBlur', key: 'blur', labelKey: 'end', min: 0 },
];

export const EFFECT_NOISE_FIELDS: readonly TEffectField[] = [
  { adornmentLabel: 'X', key: 'noiseSize', labelKey: 'noiseSize', min: 0.01 },
  { adornmentLabel: 'Y', ariaKey: 'noiseSizeY', isReadOnly: true, key: 'noiseSize', min: 0.01 },
  { icon: 'Density', key: 'density', labelKey: 'density', min: 0, unit: '%' },
];

export const EFFECT_TEXTURE_FIELDS: readonly TEffectField[] = [
  { adornmentLabel: 'X', ariaKey: 'textureSize', key: 'noiseSize', labelKey: 'size', min: 0.01 },
  { adornmentLabel: 'Y', ariaKey: 'textureSizeY', isReadOnly: true, key: 'noiseSize', min: 0.01 },
  { icon: 'Spread', key: 'radius', labelKey: 'radius', min: 0 },
];

export const EFFECT_NOISE_MULTI_FIELDS: readonly TEffectField[] = [
  ...EFFECT_NOISE_FIELDS,
  { icon: 'Opacity', key: 'opacity', labelKey: 'opacity', min: 0, unit: '%' },
];

export const EFFECT_FIELD_MAX: Partial<Record<TEffectNumberField, number>> = { density: 100, opacity: 100 };
