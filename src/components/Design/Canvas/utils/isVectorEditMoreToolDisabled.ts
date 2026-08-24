// types
import { TMoreToolName } from 'components/Design/Toolbar/VectorEditToolbar/constants';
import { ToolName } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getEligibleVectorWidthNodes } from './getEligibleVectorWidthNodes';

export const isVectorEditMoreToolDisabled = (
  toolName: TMoreToolName,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
): boolean =>
  toolName === ToolName.variableWidth &&
  (vectorEditingNodeIds.length !== 1 || getEligibleVectorWidthNodes(vectorEditingNodeIds, nodes).length === 0);
