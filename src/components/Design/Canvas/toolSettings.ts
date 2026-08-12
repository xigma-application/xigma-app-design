// hooks
import { TLineToolConfig } from './hooks/useDrawLineTool/useDrawLineTool';
import { TMediaToolConfig } from './hooks/useDrawMediaTool/useDrawMediaTool';
import { TPolygonToolConfig } from './hooks/useDrawPolygonTool/useDrawPolygonTool';
import { TShapeToolConfig } from './hooks/useDrawShapeTool/useDrawShapeTool';
import { TStarToolConfig } from './hooks/useDrawStarTool/useDrawStarTool';

// others
import {
  ELLIPSE_FILL,
  FRAME_FILL,
  LINE_STROKE,
  POLYGON_DEFAULT_SIDES,
  RECTANGLE_FILL,
  STAR_DEFAULT_POINTS,
  STAR_DEFAULT_RATIO,
} from './constants';

// types
import { NodeType, ToolName } from 'types/design/enums';

export const ELLIPSE_TOOL_SETTINGS: TShapeToolConfig = {
  fill: ELLIPSE_FILL,
  name: 'Ellipse',
  tool: ToolName.ellipse,
  type: NodeType.ellipse,
};
export const FRAME_TOOL_SETTINGS: TShapeToolConfig = { fill: FRAME_FILL, name: 'Frame', tool: ToolName.frame, type: NodeType.frame };
export const LINE_TOOL_SETTINGS: TLineToolConfig = { name: 'Line', stroke: LINE_STROKE, tool: ToolName.line };
export const MEDIA_TOOL_SETTINGS: TMediaToolConfig = { name: 'Image', tool: ToolName.media };
export const POLYGON_TOOL_SETTINGS: TPolygonToolConfig = {
  fill: ELLIPSE_FILL,
  name: 'Polygon',
  sides: POLYGON_DEFAULT_SIDES,
  tool: ToolName.polygon,
};
export const RECTANGLE_TOOL_SETTINGS: TShapeToolConfig = {
  fill: RECTANGLE_FILL,
  name: 'Rectangle',
  tool: ToolName.rectangle,
  type: NodeType.rectangle,
};
export const STAR_TOOL_SETTINGS: TStarToolConfig = {
  fill: ELLIPSE_FILL,
  name: 'Star',
  points: STAR_DEFAULT_POINTS,
  ratio: STAR_DEFAULT_RATIO,
  tool: ToolName.star,
};
