// others
import { STROKE_WEIGHT_MAX, STROKE_WEIGHT_MIN } from '../constants';

export const parseStrokeWeight = (raw: string): number | null => {
  const cleaned = raw.replace(/[^\d.]/g, '').trim();
  const parsed = Number(cleaned);

  if (cleaned !== '' && !Number.isNaN(parsed)) {
    return Math.min(STROKE_WEIGHT_MAX, Math.max(STROKE_WEIGHT_MIN, parsed));
  }

  return null;
};
