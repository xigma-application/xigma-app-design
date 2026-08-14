// types
import { TDesignState } from '../types';
import { ToolName } from 'types/design/enums';

export const handleSetActiveTool = (state: TDesignState, tool: ToolName): void => {
  state.activeTool = tool;

  switch (tool) {
    case ToolName.ellipse:
    case ToolName.line:
    case ToolName.media:
    case ToolName.polygon:
    case ToolName.rectangle:
    case ToolName.star:
      state.lastShapeTool = tool;
      break;
    case ToolName.default:
    case ToolName.hand:
    case ToolName.scale:
      state.lastMouseTool = tool;
      break;
    case ToolName.frame:
    case ToolName.section:
      state.lastFrameTool = tool;
      break;
    case ToolName.text:
    case ToolName.textOnPath:
      state.lastTextTool = tool;
      break;
    default:
      break;
  }
};
