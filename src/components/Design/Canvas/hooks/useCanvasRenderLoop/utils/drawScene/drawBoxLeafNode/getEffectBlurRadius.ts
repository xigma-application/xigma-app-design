// others
import { EFFECT_BLUR_MAX_PX } from './constants';

export const getEffectBlurRadius = (blur: number): number => Math.min(Math.max(blur, 0), EFFECT_BLUR_MAX_PX);
