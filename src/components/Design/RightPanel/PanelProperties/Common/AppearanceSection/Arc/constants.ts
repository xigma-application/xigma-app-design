// types
import { TArcFieldKey } from './types';

export const ARC_FIELD_KEYS: TArcFieldKey[] = ['start', 'sweep', 'ratio'];

export const ARC_FIELD_LIMITS: Record<TArcFieldKey, { max: number; min: number }> = {
  ratio: { max: 100, min: 0 },
  start: { max: 180, min: -180 },
  sweep: { max: 100, min: -100 },
};

export const ARC_FIELD_UNITS: Record<TArcFieldKey, string> = { ratio: '%', start: '°', sweep: '%' };
