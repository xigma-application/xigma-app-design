import { RefObject } from 'react';

// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export type TOverriddenAncestorNode = { node: TSceneNode; position: TPoint };

export const getOverriddenAncestorNode = (
  previewRef: RefObject<TAutoLayoutReorderPreview | null>,
  node: TSceneNode,
  nodesById: Record<string, TSceneNode>,
): TOverriddenAncestorNode | undefined => {
  const position = previewRef.current?.positions[node.id];

  if (!position) {
    const parent = node.parentId ? nodesById[node.parentId] : null;
    return parent ? getOverriddenAncestorNode(previewRef, parent, nodesById) : undefined;
  }

  return { node, position };
};
