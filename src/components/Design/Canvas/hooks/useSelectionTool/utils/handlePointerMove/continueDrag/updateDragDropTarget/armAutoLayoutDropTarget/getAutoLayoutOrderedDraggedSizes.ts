// store
import { getAutoLayoutChildLocalBounds } from 'store/design/utils/autoLayout/getAutoLayoutChildLocalBounds';

// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';
import { TSceneNode } from 'types/design/types';

export const getAutoLayoutOrderedDraggedSizes = (
  orderedMovedIds: string[],
  selectedNodes: TSceneNode[],
  frameRotation: number,
): TAutoLayoutChildSize[] => {
  const selectedNodesById = selectedNodes.reduce<Record<string, TSceneNode>>((byId, node) => {
    byId[node.id] = node;
    return byId;
  }, {});

  return orderedMovedIds.map((id) => {
    const bounds = getAutoLayoutChildLocalBounds(selectedNodesById[id], frameRotation);
    return { height: bounds.height, id: '__dragged__', width: bounds.width };
  });
};
