// types
import { TLineNode } from 'types/design/types';
import { TSolidPaint } from 'types/design/paint/types';

export const getLineVectorStroke = (node: TLineNode): TSolidPaint | null => {
  const [stroke, ...rest] = node.strokes.filter((paint) => paint.visible !== false);

  if (stroke?.type === 'solid') {
    if (rest.length === 0) {
      return stroke;
    }
  }

  return null;
};
