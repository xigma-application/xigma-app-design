// types
import { EffectType } from 'types/design/enums';
import { TBooleanShape } from './types';
import { TEffect } from 'types/design/types';

export const getBooleanEffectTextureKey = (type: EffectType, shape: TBooleanShape, effect: TEffect): string =>
  ['boolean', type, shape.key, effect.color, effect.blur, effect.x, effect.y].join('|');
