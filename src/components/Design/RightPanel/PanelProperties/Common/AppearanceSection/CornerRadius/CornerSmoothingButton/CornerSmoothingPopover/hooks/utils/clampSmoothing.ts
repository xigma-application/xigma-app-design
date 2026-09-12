// others
import { SMOOTHING_MAX, SMOOTHING_MIN } from '../../constants';

export const clampSmoothing = (value: number): number => Math.min(SMOOTHING_MAX, Math.max(SMOOTHING_MIN, Math.round(value)));
