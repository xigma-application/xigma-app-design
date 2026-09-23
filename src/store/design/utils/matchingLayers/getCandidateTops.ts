// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isContainerNode } from '../nodeHierarchy/isContainerNode';

const isCandidateTop = (sibling: TSceneNode | undefined, top: TSceneNode): boolean =>
  Boolean(sibling && sibling.id !== top.id && sibling.type !== NodeType.section && isContainerNode(sibling));

export const getCandidateTops = (top: TSceneNode, nodesById: Record<string, TSceneNode>, rootOrder: string[]): TSceneNode[] => {
  const scopeParent = top.parentId ? nodesById[top.parentId] : null;
  const siblingIds = scopeParent && isContainerNode(scopeParent) ? scopeParent.childIds : rootOrder;

  return siblingIds.map((siblingId) => nodesById[siblingId]).filter((sibling) => isCandidateTop(sibling, top));
};
