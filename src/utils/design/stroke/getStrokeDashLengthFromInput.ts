// others
import { STROKE_DASH_MAX_LENGTH } from 'constant/strokeDash';

export const getStrokeDashLengthFromInput = (input: string): number | undefined => {
  const raw = input.replace(/[^\d.]/g, '').trim();
  const parsed = Number(raw);

  if (raw !== '' && Number.isFinite(parsed)) {
    return Math.round(Math.min(STROKE_DASH_MAX_LENGTH, parsed) * 100) / 100;
  }
};
