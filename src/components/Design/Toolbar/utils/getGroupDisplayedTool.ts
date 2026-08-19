// types
import { ToolName } from 'types/design/enums';

export const getGroupDisplayedTool = (
  tool: ToolName,
  lastShapeTool: ToolName,
  lastMouseTool: ToolName,
  lastFrameTool: ToolName,
  lastTextTool: ToolName,
  lastPenTool: ToolName,
): ToolName => {
  switch (tool) {
    case ToolName.rectangle:
      return lastShapeTool;
    case ToolName.default:
      return lastMouseTool;
    case ToolName.frame:
      return lastFrameTool;
    case ToolName.text:
      return lastTextTool;
    case ToolName.pen:
      return lastPenTool;
    default:
      return tool;
  }
};
