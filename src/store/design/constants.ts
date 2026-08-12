// types
import { ToolName } from 'types/design/enums';
import { TViewport } from 'types/design/types';

export const DEFAULT_TOOL = ToolName.default;
export const DEFAULT_MOUSE_TOOL = ToolName.default;
export const DEFAULT_SHAPE_TOOL = ToolName.rectangle;
export const MOUSE_TOOLS: ToolName[] = [ToolName.default, ToolName.hand];
export const SHAPE_TOOLS: ToolName[] = [
  ToolName.ellipse,
  ToolName.line,
  ToolName.media,
  ToolName.polygon,
  ToolName.rectangle,
  ToolName.star,
];
export const DEFAULT_VIEWPORT: TViewport = { x: 0, y: 0, zoom: 1 };
