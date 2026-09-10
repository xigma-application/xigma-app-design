// types
import { SizingMode } from 'types/design/enums';

export type TFillFieldParseResult = { mode: SizingMode.fill; value: number } | { mode: SizingMode.fixed; value: number } | { mode: null };

export const parseFillFieldInput = (raw: string): TFillFieldParseResult => {
  const trimmed = raw.trim();
  const fillMatch = trimmed.match(/^(-?\d*\.?\d+)fr$/);

  if (fillMatch) {
    const weight = parseFloat(fillMatch[1]);

    if (weight > 0) {
      return { mode: SizingMode.fill, value: weight };
    }

    return { mode: null };
  }

  const parsed = parseFloat(trimmed);

  if (!Number.isNaN(parsed)) {
    return { mode: SizingMode.fixed, value: parsed };
  }

  return { mode: null };
};
