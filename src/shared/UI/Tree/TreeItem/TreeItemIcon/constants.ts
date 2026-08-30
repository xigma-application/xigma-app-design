// @xigma
import { TIconProps } from '@xigma/components';

// types
import { NodeType } from 'types/design/enums';

export const NODE_SHAPE_ICON_VIEW_BOX_SIZE = 16;
export const NODE_SHAPE_ICON_PADDING = 2;
export const NODE_SHAPE_ICON_MIN_EXTENT = 1;
export const NODE_SHAPE_ICON_STROKE_WIDTH = 1.5;
export const NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS = 1000;

export const BASE_NODE_ICON_MAX_CONTENT_SIZE = 10;

export const NODE_TYPE_ICON: Record<NodeType, TIconProps['name']> = {
  [NodeType.ellipse]: 'EllipseTool',
  [NodeType.frame]: 'FrameTool',
  [NodeType.group]: 'Group',
  [NodeType.line]: 'LineTool',
  [NodeType.media]: 'File',
  [NodeType.path]: 'PenTool',
  [NodeType.polygon]: 'PolygonTool',
  [NodeType.rectangle]: 'RectangleTool',
  [NodeType.section]: 'SectionTool',
  [NodeType.star]: 'StarTool',
  [NodeType.text]: 'TextTool',
  [NodeType.vector]: 'PenTool',
};
