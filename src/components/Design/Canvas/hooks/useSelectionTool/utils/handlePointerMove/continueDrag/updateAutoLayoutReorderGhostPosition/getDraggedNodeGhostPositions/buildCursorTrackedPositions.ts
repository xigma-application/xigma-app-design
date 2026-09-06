// store
import { getRotatedNodeBounds } from 'store/design/utils/getRotatedNodeBounds';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { translateBy } from './translateBy';

export const buildCursorTrackedPositions = (selectedNodes: TSceneNode[], deltaX: number, deltaY: number): Record<string, TPoint> =>
  selectedNodes.reduce<Record<string, TPoint>>((positionsById, node) => {
    positionsById[node.id] = translateBy(getRotatedNodeBounds(node), deltaX, deltaY);
    return positionsById;
  }, {});
