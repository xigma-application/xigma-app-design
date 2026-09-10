import { RefObject } from 'react';

// types
import { TGridDragGhost } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export const getOverriddenGridDragAncestor = (
  ghostRef: RefObject<TGridDragGhost | null>,
  node: TSceneNode,
  nodesById: Record<string, TSceneNode>,
): TPoint | undefined => {
  const ghost = ghostRef.current;

  if (ghost?.nodeIds.includes(node.id)) {
    return ghost.offset;
  }

  const parent = node.parentId ? nodesById[node.parentId] : null;

  return parent ? getOverriddenGridDragAncestor(ghostRef, parent, nodesById) : undefined;
};
