// types
import { TEllipseNode, TFrameNode, TPolygonNode, TRectangleNode } from 'types/design/types';

export const hasVectorStroke = (node: TEllipseNode | TFrameNode | TPolygonNode | TRectangleNode): boolean =>
  Boolean(node.strokes && node.strokes.length > 0 && node.strokeWidth);
