// others
import { PADDING_MIN } from '../constants';

export type TParsedPaddingPair = { first: number; second: number };

export const parsePaddingPair = (raw: string, fallback: TParsedPaddingPair): TParsedPaddingPair => {
  const [firstRaw, secondRaw] = raw.replace(/[^\d,]/g, '').split(',');
  const first = parseInt(firstRaw);
  const second = parseInt(secondRaw || firstRaw);

  return {
    first: Number.isNaN(first) ? fallback.first : Math.max(PADDING_MIN, first),
    second: Number.isNaN(second) ? fallback.second : Math.max(PADDING_MIN, second),
  };
};
