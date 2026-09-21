// types
import { PdfLayerType } from './enums';
import { TTextNode } from 'types/design/types';

export type TPdfRasterLayer = { nodeIds: Set<string>; type: PdfLayerType.raster };
export type TPdfTextLayer = { node: TTextNode; type: PdfLayerType.text };
export type TPdfLayer = TPdfRasterLayer | TPdfTextLayer;
