// others
import { STROKE_MITER_ANGLE_MAX, STROKE_MITER_ANGLE_MIN } from 'constant/strokeMiterAngle';

export const getStrokeMiterAngleFromInput = (input: string): number | undefined => {
  const raw = input.replace(/[^\d.-]/g, '').trim();
  const parsed = Number(raw);

  if (raw !== '' && !Number.isNaN(parsed)) {
    return Math.round(Math.min(STROKE_MITER_ANGLE_MAX, Math.max(STROKE_MITER_ANGLE_MIN, parsed)) * 100) / 100;
  }

  return undefined;
};
