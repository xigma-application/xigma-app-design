// utils
import { getTextWidth } from './getTextWidth';

const ELLIPSIS = '…';

export const truncateTextToWidth = (text: string, maxWidthPx: number, fontSizePx: number): string => {
  if (getTextWidth(text, fontSizePx) <= maxWidthPx) {
    return text;
  }

  for (let length = text.length - 1; length > 0; length--) {
    const candidate = `${text.slice(0, length)}${ELLIPSIS}`;

    if (getTextWidth(candidate, fontSizePx) <= maxWidthPx) {
      return candidate;
    }
  }

  return ELLIPSIS;
};
