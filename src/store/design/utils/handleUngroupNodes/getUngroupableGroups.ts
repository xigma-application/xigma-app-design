// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TSceneNode } from 'types/design/types';

export const getUngroupableGroups = (groupIds: string[], nodes: Record<string, TSceneNode>): TGroupNode[] =>
  groupIds.map((id) => nodes[id]).filter((node): node is TGroupNode => Boolean(node) && node.type === NodeType.group);
