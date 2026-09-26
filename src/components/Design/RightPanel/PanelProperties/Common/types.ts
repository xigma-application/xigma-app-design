// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TStarNode, TVectorNode } from 'types/design/types';

export type TShapeNode = TEllipseNode | TPolygonNode | TStarNode;

export type TShapeNodeType = NodeType.ellipse | NodeType.polygon | NodeType.star;

export type TShapeStrokeNode = TShapeNode | TVectorNode;

export type TShapeStrokeNodeType = TShapeNodeType | NodeType.vector;
