// others
import { EFFECT_MARGIN_PADDING_PX } from './constants';

// utils
import { getEffectBlurRadius } from './getEffectBlurRadius';

export const getBoxEffectMargin = (blur: number): number => Math.ceil(getEffectBlurRadius(blur)) + EFFECT_MARGIN_PADDING_PX;
