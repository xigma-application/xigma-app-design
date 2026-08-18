// others
import { DRAWING_TOOLS } from '../../../constants';

// types
import { ToolName } from 'types/design/enums';

export const getCursorClassName = (activeTool: ToolName): string | null => {
  if (activeTool === ToolName.comment) {
    return 'comment';
  }

  if (DRAWING_TOOLS.includes(activeTool)) {
    return 'drawing';
  }

  return null;
};
