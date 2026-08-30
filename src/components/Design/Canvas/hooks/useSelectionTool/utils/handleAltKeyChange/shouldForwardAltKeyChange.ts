// types
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

const ALT_HOVER_TOOLS = [ToolName.default, ToolName.move, ToolName.scale, ToolName.shapeBuilder];

export const shouldForwardAltKeyChange = (
  event: KeyboardEvent,
  activeTool: ToolName,
  lastPointerClientPosition: TPoint | null,
): lastPointerClientPosition is TPoint => event.key === 'Alt' && ALT_HOVER_TOOLS.includes(activeTool) && lastPointerClientPosition !== null;
