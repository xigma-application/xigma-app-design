// types
import { ToolName } from 'types/design/enums';
import { TViewport } from 'types/design/types';

export const DEFAULT_TOOL = ToolName.default;
export const DEFAULT_FRAME_TOOL = ToolName.frame;
export const DEFAULT_MOUSE_TOOL = ToolName.default;
export const DEFAULT_PAINT_COLOR = '#D9D9D9';
export const DEFAULT_PEN_TOOL = ToolName.pen;
export const DEFAULT_SHAPE_TOOL = ToolName.rectangle;
export const DEFAULT_TEXT_TOOL = ToolName.text;
export const DEFAULT_VIEWPORT: TViewport = { x: 0, y: 0, zoom: 1 };
export const DEFAULT_PAGE_NAME = 'Page 1';
export const MOCK_COMMENT_AUTHOR = 'Xigma';
