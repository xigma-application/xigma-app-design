// types
import { TEffect } from 'types/design/types';

// utils
import { getBoxEffectMargin } from './getBoxEffectMargin';

export const getDropShadowMargin = (effect: TEffect): number =>
  getBoxEffectMargin(effect.blur) + Math.ceil(Math.max(Math.abs(effect.x), Math.abs(effect.y)) + Math.max(0, effect.spread));
