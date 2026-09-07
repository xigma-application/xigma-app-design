// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from '../getRotatedNodeBounds';

const intersectRects = (a: TDraftRect, b: TDraftRect): TDraftRect => {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  return { height: bottom - y, width: right - x, x, y };
};

export const getClipVisibleRect = (node: TSceneNode, nodesById: Record<string, TSceneNode>): TDraftRect | null => {
  let rect: TDraftRect | null = null;
  let ancestor = node.parentId ? nodesById[node.parentId] : undefined;

  while (ancestor) {
    if (ancestor.type === NodeType.frame && ancestor.clipContent) {
      const bounds = getRotatedNodeBounds(ancestor);
      rect = rect ? intersectRects(rect, bounds) : bounds;
    }

    ancestor = ancestor.parentId ? nodesById[ancestor.parentId] : undefined;
  }

  return rect;
};
