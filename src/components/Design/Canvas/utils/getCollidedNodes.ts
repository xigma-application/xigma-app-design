// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from './getRotatedNodeBounds';
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';

export const getCollidedNodes = (
  nodes: TSceneNode[],
  area: TDraftRect,
  requireFullyInside: boolean,
  nodesById: Record<string, TSceneNode>,
): TSceneNode[] => {
  const x1 = area.x;
  const y1 = area.y;
  const x2 = area.x + area.width;
  const y2 = area.y + area.height;

  return nodes.filter((node) => {
    if (!node.hidden && !node.locked) {
      const bounds = getRotatedNodeBounds(node);
      const nodeX2 = bounds.x + bounds.width;
      const nodeY2 = bounds.y + bounds.height;
      const mustEncloseFully = requireFullyInside || isClickThroughFrame(node, nodesById);

      return mustEncloseFully
        ? x1 <= bounds.x && x2 >= nodeX2 && y1 <= bounds.y && y2 >= nodeY2
        : !(nodeX2 < x1 || bounds.x > x2 || nodeY2 < y1 || bounds.y > y2);
    }

    return false;
  });
};
