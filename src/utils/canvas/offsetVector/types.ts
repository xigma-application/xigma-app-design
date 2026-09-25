// types
import { TLineNode, TPolygonNode, TStarNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

export type TOffsetVectorNode = TLineNode | TPolygonNode | TStarNode;

export type TOffsetVectorEdgeHit = { angle: number; normal: TPoint; point: TPoint };

export type TOffsetVectorSourceOutline = { closed: boolean; points: TPoint[] };
