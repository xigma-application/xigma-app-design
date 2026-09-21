// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode } from 'types/design/types';
import { TDraftRect } from 'types/canvas';

const isBlendNormal = (node: TBoxSceneNode): boolean => !node.blendMode || node.blendMode === BlendMode.normal;

const isPlainAncestor = (node: TBoxSceneNode, allowOpacity: boolean): boolean =>
  !node.hidden && node.type !== NodeType.mask && node.rotation === 0 && (allowOpacity || (node.opacity ?? 1) === 1) && isBlendNormal(node);

const isInsideClip = (bounds: TDraftRect, ancestor: TBoxSceneNode): boolean =>
  ancestor.type !== NodeType.frame ||
  !ancestor.clipContent ||
  (bounds.x >= ancestor.x &&
    bounds.y >= ancestor.y &&
    bounds.x + bounds.width <= ancestor.x + ancestor.width &&
    bounds.y + bounds.height <= ancestor.y + ancestor.height);

export const isSafeAncestorChain = (
  bounds: TDraftRect,
  parentId: string | null,
  nodesById: Record<string, TSceneNode>,
  allowOpacity: boolean,
): boolean => {
  let isSafe = true;
  let parent = parentId ? (nodesById[parentId] as TBoxSceneNode | undefined) : undefined;

  while (isSafe && parent) {
    isSafe = isPlainAncestor(parent, allowOpacity) && isInsideClip(bounds, parent);
    parent = parent.parentId ? (nodesById[parent.parentId] as TBoxSceneNode | undefined) : undefined;
  }

  return isSafe;
};
