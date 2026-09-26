// types
import { BooleanOperation, ToolName } from 'types/design/enums';
import { TResolvedTheme, TVectorPointSelection } from './types';
import { TSolidPaint } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

export const DEFAULT_TOOL = ToolName.default;
export const DEFAULT_FRAME_TOOL = ToolName.frame;
export const DEFAULT_MOUSE_TOOL = ToolName.default;
export const DEFAULT_PAINT_COLOR = '#444444';
export const DEFAULT_PAINT: TSolidPaint = { color: DEFAULT_PAINT_COLOR, opacity: 100, type: 'solid' };
export const DEFAULT_VECTOR_PAINT_COLOR = '#D9D9D9';
export const DEFAULT_STROKE_PAINT_COLOR = '#000000';
export const DEFAULT_VECTOR_PAINT: TSolidPaint = { color: DEFAULT_VECTOR_PAINT_COLOR, opacity: 100, type: 'solid' };
export const DEFAULT_PEN_TOOL = ToolName.pen;
export const DEFAULT_SHAPE_TOOL = ToolName.rectangle;
export const DEFAULT_TEXT_TOOL = ToolName.text;
export const DEFAULT_VIEWPORT: TViewport = { x: 0, y: 0, zoom: 1 };
export const DEFAULT_PAGE_NAME = 'Page 1';
export const DEFAULT_GROUP_NAME = 'Group';
export const DEFAULT_MASK_GROUP_NAME = 'Mask group';

export const PAGE_BACKGROUND_PAINT: Record<TResolvedTheme, TSolidPaint> = {
  dark: { color: '#535353', opacity: 100, type: 'solid' },
  light: { color: '#F5F5F5', opacity: 100, type: 'solid' },
};

export const WRAP_IN_SECTION_PADDING = 25;
export const DEFAULT_BOOLEAN_NAME: Record<BooleanOperation, string> = {
  [BooleanOperation.exclude]: 'Exclude',
  [BooleanOperation.intersect]: 'Intersect',
  [BooleanOperation.subtract]: 'Subtract',
  [BooleanOperation.union]: 'Union',
};
export const MOCK_COMMENT_AUTHOR = 'Xigma';

export const TOOL_DEFAULT_NODE_NAMES: ReadonlySet<string> = new Set([
  'Frame',
  'Section',
  'Slice',
  'Rectangle',
  'Ellipse',
  'Line',
  'Arrow',
  'Polygon',
  'Star',
  'Vector',
  'Pencil',
  'Text',
  'Path',
]);

export const EMPTY_SELECTED_INDICES: number[] = [];

export const EMPTY_VECTOR_POINT_SELECTION: TVectorPointSelection = { segmentIds: [], vertexIds: [] };
