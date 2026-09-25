// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const isNestedSection = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean =>
  node.type === NodeType.section && node.parentId !== null && nodesById[node.parentId]?.type === NodeType.section;
