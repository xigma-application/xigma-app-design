// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode, TTextNode } from 'types/design/types';

const isPlainBox = (node: TBoxSceneNode): boolean =>
  !node.hidden && node.type !== NodeType.mask && (node.opacity ?? 1) === 1 && node.rotation === 0;

const isBlendNormal = (node: TBoxSceneNode): boolean => !node.blendMode || node.blendMode === BlendMode.normal;

const isInsideClip = (text: TTextNode, ancestor: TBoxSceneNode): boolean =>
  ancestor.type !== NodeType.frame ||
  !ancestor.clipContent ||
  (text.x >= ancestor.x &&
    text.y >= ancestor.y &&
    text.x + text.width <= ancestor.x + ancestor.width &&
    text.y + text.height <= ancestor.y + ancestor.height);

const isAncestorSafe = (text: TTextNode, ancestor: TBoxSceneNode): boolean =>
  isPlainBox(ancestor) && isBlendNormal(ancestor) && isInsideClip(text, ancestor);

export const canExportTextAsRealText = (
  node: TTextNode,
  nodesById: Record<string, TSceneNode>,
  fontCharacters: ReadonlySet<number>,
): boolean => {
  const isOwnStyleSupported =
    isPlainBox(node) &&
    isBlendNormal(node) &&
    !node.pathId &&
    !node.flipX &&
    !node.flipY &&
    !node.strokeWidth &&
    node.content.length > 0 &&
    [...node.content].every((char) => char === '\n' || fontCharacters.has(char.charCodeAt(0)));

  let isAncestorChainSafe = true;
  let parent = node.parentId ? (nodesById[node.parentId] as TBoxSceneNode | undefined) : undefined;

  while (isAncestorChainSafe && parent) {
    isAncestorChainSafe = isAncestorSafe(node, parent);
    parent = parent.parentId ? (nodesById[parent.parentId] as TBoxSceneNode | undefined) : undefined;
  }

  return isOwnStyleSupported && isAncestorChainSafe;
};
