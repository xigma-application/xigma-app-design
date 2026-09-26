// @xigma
import { TIconProps } from '@xigma/components';

// types
import { NodeType } from 'types/design/enums';
import { TMediaFillType } from 'utils/design/paint/getNodeMediaFillType';

export const NODE_SHAPE_ICON_VIEW_BOX_SIZE = 16;
export const NODE_SHAPE_ICON_PADDING = 2;
export const NODE_SHAPE_ICON_MIN_EXTENT = 1;
export const NODE_SHAPE_ICON_STROKE_WIDTH = 1.5;
export const NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS = 1000;

export const BASE_NODE_ICON_MAX_CONTENT_SIZE = 10;

export const NODE_TYPE_ICON: Record<NodeType, TIconProps['name']> = {
  [NodeType.boolean]: 'BooleanUnion',
  [NodeType.ellipse]: 'EllipseTool',
  [NodeType.frame]: 'FrameTool',
  [NodeType.group]: 'Group',
  [NodeType.line]: 'LineTool',
  [NodeType.mask]: 'Mask',
  [NodeType.media]: 'File',
  [NodeType.path]: 'PenTool',
  [NodeType.polygon]: 'PolygonTool',
  [NodeType.rectangle]: 'RectangleTool',
  [NodeType.section]: 'SectionTool',
  [NodeType.slice]: 'SliceTool',
  [NodeType.star]: 'StarTool',
  [NodeType.text]: 'TextTool',
  [NodeType.vector]: 'PenTool',
};

export const MEDIA_FILL_ICON: Record<TMediaFillType, TIconProps['name']> = {
  image: 'Image',
  video: 'Video',
};
