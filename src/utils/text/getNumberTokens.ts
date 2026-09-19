export type TNumberToken = { end: number; start: number; value: number };

export const getNumberTokens = (text: string): TNumberToken[] =>
  Array.from(text.matchAll(/-?\d+(?:\.\d+)?/g), (match) => ({
    end: match.index + match[0].length,
    start: match.index,
    value: Number(match[0]),
  }));
