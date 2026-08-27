// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TLineNode, TPolygonNode, TRectangleNode, TStarNode, TVectorNode } from 'types/design/types';

// utils
import { convertEllipseToVector } from './convertEllipseToVector';
import { convertLineToVector } from './convertLineToVector';
import { convertPolygonToVector } from './convertPolygonToVector';
import { convertRectangleToVector } from './convertRectangleToVector';
import { convertStarToVector } from './convertStarToVector';

export type TConvertibleToVectorNode = TEllipseNode | TLineNode | TPolygonNode | TRectangleNode | TStarNode;

export const isConvertibleToVectorNode = (node: { type: NodeType }): node is TConvertibleToVectorNode =>
  node.type === NodeType.ellipse ||
  node.type === NodeType.line ||
  node.type === NodeType.polygon ||
  node.type === NodeType.rectangle ||
  node.type === NodeType.star;

export const convertNodeToVector = (node: TConvertibleToVectorNode): TVectorNode => {
  switch (node.type) {
    case NodeType.rectangle:
      return convertRectangleToVector(node);
    case NodeType.ellipse:
      return convertEllipseToVector(node);
    case NodeType.polygon:
      return convertPolygonToVector(node);
    case NodeType.star:
      return convertStarToVector(node);
    case NodeType.line:
      return convertLineToVector(node);
    // no default
  }
};
