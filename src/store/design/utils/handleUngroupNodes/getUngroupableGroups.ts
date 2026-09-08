// types
import { TGroupLikeNode, TSceneNode } from 'types/design/types';

// utils
import { isGroupLikeNode } from '../nodeHierarchy/isGroupLikeNode';

export const getUngroupableGroups = (groupIds: string[], nodes: Record<string, TSceneNode>): TGroupLikeNode[] =>
  groupIds.map((id) => nodes[id]).filter((node): node is TGroupLikeNode => Boolean(node) && isGroupLikeNode(node));
