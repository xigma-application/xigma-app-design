// types
import { SvgLayerType } from './enums';
import { TEllipseNode, TFrameNode, TLineNode, TPolygonNode, TRectangleNode, TStarNode, TVectorNode } from 'types/design/types';

export type TSvgShapeNode = TFrameNode | TRectangleNode | TEllipseNode | TPolygonNode | TStarNode | TLineNode | TVectorNode;

export type TSvgRasterLayer = { nodeIds: Set<string>; type: SvgLayerType.raster };

export type TSvgVectorLayer = { node: TSvgShapeNode; type: SvgLayerType.vector };

export type TSvgLayer = TSvgRasterLayer | TSvgVectorLayer;
