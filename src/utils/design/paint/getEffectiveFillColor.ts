// types
import { TPaint } from 'types/design/paint/types';

export const getEffectiveFillColor = (fills: TPaint[]): string | null => {
  const topVisiblePaint = fills.find((paint) => paint.visible !== false);

  if (topVisiblePaint) {
    if (topVisiblePaint.type === 'solid' && topVisiblePaint.opacity >= 100) {
      return topVisiblePaint.color;
    }
  }

  return null;
};
