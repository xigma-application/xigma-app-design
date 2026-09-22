// types
import { SvgLayerType } from './enums';
import {
  TEllipseNode,
  TFrameNode,
  TLineNode,
  TMediaNode,
  TPolygonNode,
  TRectangleNode,
  TStarNode,
  TTextNode,
  TVectorNode,
} from 'types/design/types';

export type TSvgShapeNode = TFrameNode | TRectangleNode | TEllipseNode | TPolygonNode | TStarNode | TLineNode | TVectorNode | TMediaNode;

export type TSvgRasterLayer = { nodeIds: Set<string>; type: SvgLayerType.raster };

export type TSvgTextLayer = { node: TTextNode; type: SvgLayerType.text };

export type TSvgTextCurvesLayer = { node: TTextNode; type: SvgLayerType.textCurves };

export type TSvgVectorLayer = { node: TSvgShapeNode; type: SvgLayerType.vector };

export type TSvgLayer = TSvgRasterLayer | TSvgTextLayer | TSvgTextCurvesLayer | TSvgVectorLayer;
