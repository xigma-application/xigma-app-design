// store
import { getRotatedNodeBounds } from 'store/design/utils/getRotatedNodeBounds';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getOverriddenAncestorNode } from './getOverriddenAncestorNode';

export const getAutoLayoutReorderRenderNode = <T extends TSceneNode>(
  refs: TCanvasRefs,
  node: T,
  nodesById: Record<string, TSceneNode>,
): T => {
  const override = getOverriddenAncestorNode(refs.transform.autoLayoutReorderPreviewRef, node, nodesById);

  if (override) {
    const ancestorBounds = getRotatedNodeBounds(override.node);
    const deltaX = override.position.x - ancestorBounds.x;
    const deltaY = override.position.y - ancestorBounds.y;

    return { ...node, ...getGeometryDeltaChanges(node, deltaX, deltaY) } as T;
  }

  return node;
};
