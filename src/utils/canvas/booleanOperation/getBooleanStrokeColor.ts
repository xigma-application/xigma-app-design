// types
import { TBooleanNode } from 'types/design/types';

export const getBooleanStrokeColor = (node: Pick<TBooleanNode, 'strokes'>): string | null => {
  const paint = node.strokes?.find((stroke) => stroke.visible !== false);

  switch (paint?.type) {
    case 'solid':
      return paint.color;
    case 'gradient-angular':
    case 'gradient-diamond':
    case 'gradient-linear':
    case 'gradient-radial':
      return paint.stops[0]?.color ?? null;
    default:
      return null;
  }
};
