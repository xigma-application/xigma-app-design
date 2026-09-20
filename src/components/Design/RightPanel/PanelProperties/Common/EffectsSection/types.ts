// others
import { EFFECT_NUMBER_FIELDS, EFFECT_PROGRESSIVE_BLUR_FIELDS } from './constants';

export type TEffectField = (typeof EFFECT_NUMBER_FIELDS)[number] | (typeof EFFECT_PROGRESSIVE_BLUR_FIELDS)[number];

export type TEffectNumberField = TEffectField['key'];
