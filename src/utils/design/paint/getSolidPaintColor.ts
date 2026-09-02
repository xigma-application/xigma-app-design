// types
import { TPaint } from 'types/design/paint/types';

export const getSolidPaintColor = (paints: TPaint[]): string | null => {
  const [paint] = paints;
  return paint?.type === 'solid' ? paint.color : null;
};
