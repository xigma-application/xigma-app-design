// others
import { SLIDER_THUMB_RADIUS } from '../constants';

// utils
import { getThumbOffset } from './getThumbOffset';

export const getMarkOffset = (markValue: number, min: number, max: number): string =>
  getThumbOffset((markValue - min) / (max - min), SLIDER_THUMB_RADIUS);
