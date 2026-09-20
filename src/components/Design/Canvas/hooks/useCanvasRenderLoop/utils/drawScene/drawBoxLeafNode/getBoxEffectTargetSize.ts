// others
import { EFFECT_TARGET_MAX_PX } from './constants';

// utils
import { clamp } from 'utils/math/clamp';

export type TBoxEffectTargetSize = { height: number; width: number };

export const getBoxEffectTargetSize = (node: { height: number; width: number }, margin: number): TBoxEffectTargetSize => ({
  height: clamp(Math.ceil(node.height + margin * 2), 1, EFFECT_TARGET_MAX_PX),
  width: clamp(Math.ceil(node.width + margin * 2), 1, EFFECT_TARGET_MAX_PX),
});
