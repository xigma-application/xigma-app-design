// types
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

export const hasNoiseStroke = (node: TFrameNode | TRectangleNode | TSectionNode): boolean => {
  const hasLegacyStroke = 'strokeColor' in node && Boolean(node.strokeColor) && Boolean(node.strokeWidth);
  const hasPaintStroke = Boolean(node.strokes && node.strokes.length > 0 && node.strokeWidth);

  return hasLegacyStroke || hasPaintStroke;
};
