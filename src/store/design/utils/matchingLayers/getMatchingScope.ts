// types
import { NodeType } from 'types/design/enums';
import { TMatchingScope } from './types';
import { TSceneNode } from 'types/design/types';

const isScopeRoot = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean =>
  node.parentId === null || nodesById[node.parentId]?.type === NodeType.section;

export const getMatchingScope = (node: TSceneNode, nodesById: Record<string, TSceneNode>): TMatchingScope | null => {
  const path: TSceneNode[] = [];
  let current = node;

  while (!isScopeRoot(current, nodesById)) {
    const parent = nodesById[current.parentId as string];

    if (parent) {
      path.unshift(current);
      current = parent;
    } else {
      return null;
    }
  }

  if (path.length > 0) {
    return { path, top: current };
  }

  return null;
};
