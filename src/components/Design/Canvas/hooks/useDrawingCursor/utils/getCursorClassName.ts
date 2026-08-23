// others
import { DRAWING_TOOLS } from '../../../constants';

// types
import { ToolName } from 'types/design/enums';

export const getCursorClassName = (activeTool: ToolName): string | null => {
  switch (activeTool) {
    case ToolName.comment:
      return 'comment';
    case ToolName.cut:
      return 'cut-off';
    case ToolName.paint:
      return 'paint';
    case ToolName.pen:
      return 'pen';
    case ToolName.pencil:
      return 'pencil';
    case ToolName.shapeBuilder:
      return 'add';
    default:
      return DRAWING_TOOLS.includes(activeTool) ? 'drawing' : null;
  }
};
