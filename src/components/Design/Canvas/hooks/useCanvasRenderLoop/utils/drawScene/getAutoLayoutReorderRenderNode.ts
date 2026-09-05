// store
import { getNodeAxisAlignedBounds } from 'store/design/utils/getNodeAxisAlignedBounds';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';

export const getAutoLayoutReorderRenderNode = (refs: TCanvasRefs, node: TSceneNode): TSceneNode => {
  const overridePosition = refs.transform.autoLayoutReorderPreviewRef.current?.positions[node.id];

  if (overridePosition) {
    const bounds = getNodeAxisAlignedBounds(node);
    const deltaX = overridePosition.x - bounds.x;
    const deltaY = overridePosition.y - bounds.y;

    return { ...node, ...getGeometryDeltaChanges(node, deltaX, deltaY) } as TSceneNode;
  }

  return node;
};
