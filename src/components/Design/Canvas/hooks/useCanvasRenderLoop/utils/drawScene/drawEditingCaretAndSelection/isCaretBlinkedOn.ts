// others
import { CARET_BLINK_INTERVAL_MS } from 'constant/canvas';

export const isCaretBlinkedOn = (selectionChangedAt: number): boolean =>
  Math.floor((Date.now() - selectionChangedAt) / CARET_BLINK_INTERVAL_MS) % 2 === 0;
