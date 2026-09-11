// types
import { SizingMode } from 'types/design/enums';

export type TFillFieldParseResult = { mode: SizingMode.fill; value: number } | { mode: SizingMode.fixed; value: number } | { mode: null };

export const parseFillFieldInput = (raw: string): TFillFieldParseResult => {
  const trimmed = raw.trim();
  const fillMatch = trimmed.match(/^(-?\d*\.?\d+)fr$/);
  const weight = fillMatch ? parseFloat(fillMatch[1]) : NaN;
  const parsed = parseFloat(trimmed);

  switch (true) {
    case fillMatch !== null && weight > 0:
      return { mode: SizingMode.fill, value: weight };
    case fillMatch === null && !Number.isNaN(parsed):
      return { mode: SizingMode.fixed, value: parsed };
    default:
      return { mode: null };
  }
};
