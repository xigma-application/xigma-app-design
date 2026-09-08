// others
import { AUTO_LAYOUT_PADDING_VALUE_MIN } from '../constants';

export const clampAutoLayoutPaddingValue = (value: number): number => Math.max(AUTO_LAYOUT_PADDING_VALUE_MIN, Math.round(value));
