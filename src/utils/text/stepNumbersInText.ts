// types
import { TNumberToken, getNumberTokens } from './getNumberTokens';

// utils
import { clamp } from 'utils/math/clamp';
import { getTargetNumberTokens } from './getTargetNumberTokens';

export type TStepNumbersOptions = { max?: number; min?: number };

export type TSteppedText = { selectionEnd: number; selectionStart: number; text: string };

const formatNumber = (value: number): string => String(Math.round(value * 100) / 100);

export const stepNumbersInText = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  delta: number,
  { max = Infinity, min = -Infinity }: TStepNumbersOptions = {},
): TSteppedText | null => {
  const tokens = getNumberTokens(text);
  const targets = new Set<TNumberToken>(getTargetNumberTokens(tokens, selectionStart, selectionEnd));

  if (targets.size > 0) {
    let result = '';
    let cursor = 0;
    let newStart = -1;
    let newEnd = 0;

    tokens.forEach((token) => {
      result += text.slice(cursor, token.start);
      cursor = token.end;

      if (targets.has(token)) {
        newStart = newStart === -1 ? result.length : newStart;
        result += formatNumber(clamp(token.value + delta, min, max));
        newEnd = result.length;
      } else {
        result += text.slice(token.start, token.end);
      }
    });

    return { selectionEnd: newEnd, selectionStart: newStart, text: result + text.slice(cursor) };
  }

  return null;
};
