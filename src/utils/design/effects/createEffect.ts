// others
import {
  DEFAULT_EFFECT_BLUR,
  DEFAULT_EFFECT_COLOR,
  DEFAULT_EFFECT_OPACITY,
  DEFAULT_EFFECT_SPREAD,
  DEFAULT_EFFECT_X,
  DEFAULT_EFFECT_Y,
} from 'constant/effect';

// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

export const createEffect = (type: EffectType): TEffect => ({
  blendMode: BlendMode.normal,
  blur: DEFAULT_EFFECT_BLUR,
  color: DEFAULT_EFFECT_COLOR,
  opacity: DEFAULT_EFFECT_OPACITY,
  spread: DEFAULT_EFFECT_SPREAD,
  type,
  x: DEFAULT_EFFECT_X,
  y: DEFAULT_EFFECT_Y,
});
