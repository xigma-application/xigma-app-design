// types
import { TFrameNode, TRectangleNode } from 'types/design/types';

export const hasVectorStroke = (node: TFrameNode | TRectangleNode): boolean =>
  Boolean(node.strokes && node.strokes.length > 0 && node.strokeWidth);
