// types
import { TBooleanNode } from 'types/design/types';

export const getBooleanStrokeColor = (node: Pick<TBooleanNode, 'strokes'>): string | null => {
  const paint = node.strokes?.find((stroke) => stroke.visible !== false);

  return paint?.type === 'solid' ? paint.color : null;
};
