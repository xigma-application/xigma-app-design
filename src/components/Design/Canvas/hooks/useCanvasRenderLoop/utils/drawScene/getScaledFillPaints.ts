// types
import { TPaint } from 'types/design/paint/types';

export const getScaledFillPaints = (paints: TPaint[], opacity: number): TPaint[] =>
  opacity === 1 ? paints : paints.map((paint) => ({ ...paint, opacity: paint.opacity * opacity }));
