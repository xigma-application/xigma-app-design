// types
import { TPaint, TPaintProperty } from 'types/design/paint/types';

export const getPaintsChange = (property: TPaintProperty | undefined, paints: TPaint[]): { fills: TPaint[] } | { strokes: TPaint[] } =>
  property === 'strokes' ? { strokes: paints } : { fills: paints };
