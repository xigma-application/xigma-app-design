// types
import { ToolName } from 'types/design/enums';

export const getGroupDisplayedTool = (
  tool: ToolName,
  lastShapeTool: ToolName,
  lastMouseTool: ToolName,
  lastFrameTool: ToolName,
  lastTextTool: ToolName,
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
    default:
      return tool;
  }
};
