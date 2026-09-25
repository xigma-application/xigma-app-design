// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TStarNode } from 'types/design/types';

export type TShapeNode = TEllipseNode | TPolygonNode | TStarNode;

export type TShapeNodeType = NodeType.ellipse | NodeType.polygon | NodeType.star;
