// others
import { OPACITY_MAX, OPACITY_MIN } from '../../constants';

export const clampOpacity = (value: number): number => Math.min(OPACITY_MAX, Math.max(OPACITY_MIN, Math.round(value)));
