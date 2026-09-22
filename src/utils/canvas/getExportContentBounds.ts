// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TFrameNode, TSceneNode } from 'types/design/types';
import { TDraftRect } from 'types/canvas';
import { TPaint } from 'types/design/paint/types';

// utils
import { getExportSubtreeNodes } from './getExportSubtreeNodes';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { unionRects } from './unionRects';

const hasVisiblePaint = (paints: TPaint[] | undefined): boolean => (paints ?? []).some((paint) => paint.visible !== false);

const hasOwnVisiblePaint = (node: TFrameNode): boolean =>
  hasVisiblePaint(node.fills) || hasVisiblePaint(node.strokes) || Boolean(node.strokeColor && node.strokeWidth);

const contributesOwnBounds = (node: TSceneNode): boolean => {
  switch (node.type) {
    case NodeType.group:
    case NodeType.mask:
    case NodeType.section:
      return false;
    case NodeType.frame:
      return hasOwnVisiblePaint(node);
    default:
      return true;
  }
};

const intersectRects = (a: TDraftRect, b: TDraftRect): TDraftRect | null => {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  return right > x && bottom > y ? { height: bottom - y, width: right - x, x, y } : null;
};

const intersectWithClippingAncestors = (
  bounds: TDraftRect,
  startParentId: string | null,
  nodesById: Record<string, TSceneNode>,
  rootId: string,
): TDraftRect | null => {
  let result: TDraftRect | null = bounds;
  let currentId = startParentId;

  while (result && currentId) {
    const ancestor = nodesById[currentId] as TBoxSceneNode | undefined;

    if (!ancestor) {
      return result;
    }

    if (ancestor.type === NodeType.frame && ancestor.clipContent) {
      result = intersectRects(result, getRotatedNodeBounds(ancestor));
    }

    if (currentId === rootId) {
      return result;
    }

    currentId = ancestor.parentId;
  }

  return result;
};

export const getExportContentBounds = (nodeId: string, nodesById: Record<string, TSceneNode>): TDraftRect => {
  const rootNode = nodesById[nodeId];

  if (rootNode) {
    const union = getExportSubtreeNodes(nodeId, nodesById).reduce<TDraftRect | null>((accumulated, node) => {
      if (contributesOwnBounds(node)) {
        const clipped = intersectWithClippingAncestors(getRotatedNodeBounds(node), node.parentId, nodesById, nodeId);

        if (clipped) {
          return unionRects(accumulated, clipped);
        }
      }

      return accumulated;
    }, null);

    return union ?? getRotatedNodeBounds(rootNode);
  }

  return { height: 0, width: 0, x: 0, y: 0 };
};
