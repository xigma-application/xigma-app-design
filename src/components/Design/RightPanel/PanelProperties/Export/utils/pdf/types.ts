// types
import { PdfLayerType } from './enums';
import { TEllipseNode, TFrameNode, TLineNode, TPolygonNode, TRectangleNode, TStarNode, TTextNode } from 'types/design/types';

export type TPdfShapeNode = TFrameNode | TRectangleNode | TEllipseNode | TPolygonNode | TStarNode | TLineNode;

export type TPdfRasterLayer = { nodeIds: Set<string>; type: PdfLayerType.raster };

export type TPdfTextLayer = { node: TTextNode; type: PdfLayerType.text };

export type TPdfVectorLayer = { node: TPdfShapeNode; type: PdfLayerType.vector };

export type TPdfLayer = TPdfRasterLayer | TPdfTextLayer | TPdfVectorLayer;
