// others
import { PADDING_MIN } from '../../../constants';

export const clamp = (value: number): number => Math.max(PADDING_MIN, Math.round(value));
