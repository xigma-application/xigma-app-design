// types
import { PdfLayerType } from './enums';
import { TEllipseNode, TFrameNode, TLineNode, TPolygonNode, TRectangleNode, TStarNode, TTextNode, TVectorNode } from 'types/design/types';

export type TPdfShapeNode = TFrameNode | TRectangleNode | TEllipseNode | TPolygonNode | TStarNode | TLineNode | TVectorNode;

export type TPdfRasterLayer = { nodeIds: Set<string>; type: PdfLayerType.raster };

export type TPdfTextLayer = { node: TTextNode; type: PdfLayerType.text };

export type TPdfTextCurvesLayer = { node: TTextNode; type: PdfLayerType.textCurves };

export type TPdfVectorLayer = { node: TPdfShapeNode; type: PdfLayerType.vector };

export type TPdfLayer = TPdfRasterLayer | TPdfTextLayer | TPdfTextCurvesLayer | TPdfVectorLayer;
