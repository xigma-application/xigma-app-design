// others
import { STROKE_WEIGHT_MAX, STROKE_WEIGHT_MIN } from '../constants';

export const clampStrokeWeight = (weight: number): number => Math.min(STROKE_WEIGHT_MAX, Math.max(STROKE_WEIGHT_MIN, weight));
