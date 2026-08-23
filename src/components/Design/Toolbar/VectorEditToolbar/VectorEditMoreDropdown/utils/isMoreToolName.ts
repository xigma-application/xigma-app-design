// others
import { TMoreToolName } from '../../constants';

// types
import { ToolName } from 'types/design/enums';

export const isMoreToolName = (toolName: ToolName): toolName is TMoreToolName =>
  toolName === ToolName.shapeBuilder || toolName === ToolName.variableWidth;
