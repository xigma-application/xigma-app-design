// others
import { CSS_RGBA_PATTERN } from '../constants';

export type TCssChannel = 'a' | 'b' | 'g' | 'r';
export type TCssToken = { channel: TCssChannel; end: number; start: number };

const findTokenRanges = (value: string, channelTexts: { channel: TCssChannel; text: string }[]): TCssToken[] => {
  const tokens: TCssToken[] = [];
  let searchFrom = 0;

  for (const { channel, text } of channelTexts) {
    const start = value.indexOf(text, searchFrom);
    const end = start + text.length;

    tokens.push({ channel, end, start });
    searchFrom = end;
  }

  return tokens;
};

export const tokenizeCssColor = (value: string): TCssToken[] | null => {
  const match = value.match(CSS_RGBA_PATTERN);

  if (match) {
    const [, r, g, b, a] = match;
    const channelTexts: { channel: TCssChannel; text: string }[] = [
      { channel: 'r', text: r },
      { channel: 'g', text: g },
      { channel: 'b', text: b },
      ...(a === undefined ? [] : [{ channel: 'a' as const, text: a }]),
    ];

    return findTokenRanges(value, channelTexts);
  }

  return null;
};
