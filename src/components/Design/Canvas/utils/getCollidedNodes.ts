// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from './getRotatedNodeBounds';
import { getStrokePadding } from './getNodeAtPoint/getStrokePadding';
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';

const getPaddedNodeBounds = (node: TSceneNode): TDraftRect => {
  const rotatedBounds = getRotatedNodeBounds(node);
  const strokePadding = getStrokePadding(node);

  return {
    height: rotatedBounds.height + strokePadding * 2,
    width: rotatedBounds.width + strokePadding * 2,
    x: rotatedBounds.x - strokePadding,
    y: rotatedBounds.y - strokePadding,
  };
};

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
      const bounds = getPaddedNodeBounds(node);
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
