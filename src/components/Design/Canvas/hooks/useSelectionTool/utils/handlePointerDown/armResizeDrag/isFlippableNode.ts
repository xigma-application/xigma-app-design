// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TMediaNode, TPolygonNode, TSceneNode, TStarNode, TTextNode } from 'types/design/types';

export const isFlippableNode = (node: TSceneNode): node is TEllipseNode | TMediaNode | TPolygonNode | TStarNode | TTextNode =>
  node.type === NodeType.ellipse ||
  node.type === NodeType.media ||
  node.type === NodeType.text ||
  node.type === NodeType.polygon ||
  node.type === NodeType.star;
