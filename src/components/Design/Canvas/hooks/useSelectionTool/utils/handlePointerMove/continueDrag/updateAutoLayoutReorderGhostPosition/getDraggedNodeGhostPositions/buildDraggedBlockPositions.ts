// store
import { getRotatedNodeBounds } from 'store/design/utils/getRotatedNodeBounds';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { translateBy } from './translateBy';

export const buildDraggedBlockPositions = (
  selectedNodes: TSceneNode[],
  offsets: Record<string, TPoint>,
  grabbedGhost: TPoint,
  deltaX: number,
  deltaY: number,
): Record<string, TPoint> =>
  selectedNodes.reduce<Record<string, TPoint>>((positionsById, node) => {
    const offset = offsets[node.id];

    if (offset) {
      positionsById[node.id] = { x: grabbedGhost.x + offset.x, y: grabbedGhost.y + offset.y };
    } else {
      positionsById[node.id] = translateBy(getRotatedNodeBounds(node), deltaX, deltaY);
    }

    return positionsById;
  }, {});
