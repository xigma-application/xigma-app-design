// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getClipVisibleRect } from '../../../../utils/getNodeAtPoint/getClipVisibleRect';
import { getRotatedNodeBounds } from '../../../../utils/getRotatedNodeBounds';

const rectsOverlap = (a: TDraftRect, b: TDraftRect): boolean =>
  a.width > 0 && a.height > 0 && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

const visibleBounds = (node: TSceneNode, clipRect: TDraftRect): TDraftRect => {
  const bounds = getRotatedNodeBounds(node);
  const x = Math.max(bounds.x, clipRect.x);
  const y = Math.max(bounds.y, clipRect.y);
  const right = Math.min(bounds.x + bounds.width, clipRect.x + clipRect.width);
  const bottom = Math.min(bounds.y + bounds.height, clipRect.y + clipRect.height);

  return { height: bottom - y, width: right - x, x, y };
};

export const dropClippedMarqueeNodes = (
  nodes: TSceneNode[],
  marqueeRect: TDraftRect,
  nodesById: Record<string, TSceneNode>,
): TSceneNode[] =>
  nodes.filter((node) => {
    const clipRect = getClipVisibleRect(node, nodesById);
    return !clipRect || rectsOverlap(visibleBounds(node, clipRect), marqueeRect);
  });
