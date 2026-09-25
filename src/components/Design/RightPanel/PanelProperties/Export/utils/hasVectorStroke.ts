// types
import { TEllipseNode, TFrameNode, TPolygonNode, TRectangleNode, TStarNode } from 'types/design/types';

export const hasVectorStroke = (node: TEllipseNode | TFrameNode | TPolygonNode | TRectangleNode | TStarNode): boolean =>
  Boolean(node.strokes && node.strokes.length > 0 && node.strokeWidth);
