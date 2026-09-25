// types
import { TEllipseNode, TFrameNode, TRectangleNode } from 'types/design/types';

export const hasVectorStroke = (node: TEllipseNode | TFrameNode | TRectangleNode): boolean =>
  Boolean(node.strokes && node.strokes.length > 0 && node.strokeWidth);
