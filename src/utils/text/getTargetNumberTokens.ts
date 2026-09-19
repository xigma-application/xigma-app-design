// types
import { TNumberToken } from './getNumberTokens';

const getDistanceToToken = (token: TNumberToken, caret: number): number => {
  if (caret < token.start) {
    return token.start - caret;
  }

  return Math.max(0, caret - token.end);
};

const getNearestToken = (tokens: TNumberToken[], caret: number): TNumberToken[] => {
  const nearest = tokens.reduce(
    (best, token) => (getDistanceToToken(token, caret) < getDistanceToToken(best, caret) ? token : best),
    tokens[0],
  );
  return nearest ? [nearest] : [];
};

export const getTargetNumberTokens = (tokens: TNumberToken[], selectionStart: number, selectionEnd: number): TNumberToken[] => {
  if (selectionStart === selectionEnd) {
    return getNearestToken(tokens, selectionStart);
  }

  const overlapping = tokens.filter((token) => token.end > selectionStart && token.start < selectionEnd);

  return overlapping.length > 0 ? overlapping : getNearestToken(tokens, selectionStart);
};
