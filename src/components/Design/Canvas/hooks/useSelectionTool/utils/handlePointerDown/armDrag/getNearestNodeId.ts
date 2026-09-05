// store
import { getRotatedNodeBounds } from 'store/design/utils/getRotatedNodeBounds';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

const distanceToRect = (point: TPoint, rect: TDraftRect): number => {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height));

  return Math.hypot(dx, dy);
};

export const getNearestNodeId = (nodeIds: string[], nodesById: Record<string, TSceneNode>, point: TPoint): string | null =>
  nodeIds.reduce<{ distance: number; id: string | null }>(
    (nearest, id) => {
      const node = nodesById[id];

      if (node) {
        const distance = distanceToRect(point, getRotatedNodeBounds(node));

        if (distance < nearest.distance) {
          return { distance, id };
        }
      }

      return nearest;
    },
    { distance: Infinity, id: null },
  ).id;
