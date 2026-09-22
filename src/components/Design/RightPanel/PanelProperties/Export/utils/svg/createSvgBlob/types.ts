// types
import { ExportImageResampling } from '../../../enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export type TSvgDrawContext = {
  bounds: TDraftRect;
  ignoreOverlappingLayers: boolean;
  imageResampling: ExportImageResampling;
  includeIdAttribute: boolean;
  isSoleRasterLayer: boolean;
  jpegQuality: number;
  nodeId: string;
  nodesById: Record<string, TSceneNode>;
  rasterScale: number;
};
