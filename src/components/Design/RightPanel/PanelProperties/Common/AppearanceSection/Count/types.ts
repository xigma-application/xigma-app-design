// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode, TStarNode } from 'types/design/types';

export type TCountNode = TPolygonNode | TStarNode;

export type TCountNodeType = NodeType.polygon | NodeType.star;
