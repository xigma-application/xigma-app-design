// others
import { CORNER_RADIUS_MIN } from '../../../constants';

export const clamp = (value: number): number => Math.max(CORNER_RADIUS_MIN, Math.round(value));
