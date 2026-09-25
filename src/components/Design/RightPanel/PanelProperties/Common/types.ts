// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode } from 'types/design/types';

export type TShapeNode = TEllipseNode | TPolygonNode;

export type TShapeNodeType = NodeType.ellipse | NodeType.polygon;
