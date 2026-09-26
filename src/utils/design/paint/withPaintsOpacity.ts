// types
import { TPaint } from 'types/design/paint/types';

export const withPaintsOpacity = (paints: TPaint[], alpha: number): TPaint[] =>
  alpha === 1 ? paints : paints.map((paint) => ({ ...paint, opacity: paint.opacity * alpha }));
