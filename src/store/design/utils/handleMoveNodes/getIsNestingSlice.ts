// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getIsNestingSlice = (targetParentId: string | null, nodeIds: string[], nodesById: Record<string, TSceneNode>): boolean =>
  targetParentId !== null && nodeIds.some((id) => nodesById[id]?.type === NodeType.slice);
