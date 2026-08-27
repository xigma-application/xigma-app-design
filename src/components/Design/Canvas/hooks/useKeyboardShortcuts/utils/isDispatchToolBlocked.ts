// types
import { TSceneNode } from 'types/design/types';
import { ToolName } from 'types/design/enums';

// utils
import { isMoreToolName } from 'components/Design/Toolbar/VectorEditToolbar/VectorEditMoreDropdown/utils/isMoreToolName';
import { isVectorEditMoreToolDisabled } from 'components/Design/Canvas/utils/isVectorEditMoreToolDisabled';

const VECTOR_EDIT_ALLOWED_TOOLS: ToolName[] = [
  ToolName.pen,
  ToolName.pencil,
  ToolName.lasso,
  ToolName.paint,
  ToolName.move,
  ToolName.bend,
  ToolName.cut,
  ToolName.erase,
  ToolName.shapeBuilder,
  ToolName.variableWidth,
];

export const isDispatchToolBlocked = (tool: ToolName, vectorEditingNodeIds: string[], nodes: Record<string, TSceneNode>): boolean =>
  (vectorEditingNodeIds.length > 0 && !VECTOR_EDIT_ALLOWED_TOOLS.includes(tool)) ||
  (isMoreToolName(tool) && isVectorEditMoreToolDisabled(tool, vectorEditingNodeIds, nodes));
