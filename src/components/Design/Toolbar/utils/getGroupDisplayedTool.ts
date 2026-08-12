// types
import { ToolName } from 'types/design/enums';

export const getGroupDisplayedTool = (tool: ToolName, lastShapeTool: ToolName, lastMouseTool: ToolName): ToolName => {
  if (tool === ToolName.rectangle) {
    return lastShapeTool;
  }

  if (tool === ToolName.default) {
    return lastMouseTool;
  }

  return tool;
};
