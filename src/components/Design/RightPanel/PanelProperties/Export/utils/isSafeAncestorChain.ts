// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode } from 'types/design/types';
import { TDraftRect } from 'types/canvas';

// utils
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { rotatePoint } from 'utils/math/rotatePoint';

const UNSUPPORTED_BLEND_MODES: BlendMode[] = [BlendMode.plusDarker, BlendMode.plusLighter];

const isBlendNormal = (node: TBoxSceneNode): boolean => !node.blendMode || node.blendMode === BlendMode.normal;

const isBlendSupported = (node: TBoxSceneNode): boolean => !node.blendMode || !UNSUPPORTED_BLEND_MODES.includes(node.blendMode);

const isPlainAncestor = (node: TBoxSceneNode, allowOpacity: boolean, allowBlendMode: boolean): boolean =>
  !node.hidden &&
  node.type !== NodeType.mask &&
  (allowOpacity || (node.opacity ?? 1) === 1) &&
  (allowBlendMode ? isBlendSupported(node) : isBlendNormal(node));

const isInsideClip = (bounds: TDraftRect, ancestor: TBoxSceneNode): boolean => {
  if (ancestor.type === NodeType.frame && ancestor.clipContent) {
    const center = { x: ancestor.x + ancestor.width / 2, y: ancestor.y + ancestor.height / 2 };
    const corners = getRectCorners(bounds).map((corner) => rotatePoint(corner, center, -ancestor.rotation));

    return corners.every(
      (corner) =>
        corner.x >= ancestor.x &&
        corner.y >= ancestor.y &&
        corner.x <= ancestor.x + ancestor.width &&
        corner.y <= ancestor.y + ancestor.height,
    );
  }

  return true;
};

export const isSafeAncestorChain = (
  bounds: TDraftRect,
  parentId: string | null,
  nodesById: Record<string, TSceneNode>,
  allowOpacity: boolean,
  allowBlendMode: boolean,
): boolean => {
  let isSafe = true;
  let parent = parentId ? (nodesById[parentId] as TBoxSceneNode | undefined) : undefined;

  while (isSafe && parent) {
    isSafe = isPlainAncestor(parent, allowOpacity, allowBlendMode) && isInsideClip(bounds, parent);
    parent = parent.parentId ? (nodesById[parent.parentId] as TBoxSceneNode | undefined) : undefined;
  }

  return isSafe;
};
