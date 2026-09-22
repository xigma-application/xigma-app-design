// types
import { BlendMode } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { isSafeAncestorChain } from '../isSafeAncestorChain';

const isOwnStyleSupported = (node: TTextNode, fontCharacters: ReadonlySet<number>): boolean =>
  !node.hidden &&
  (node.opacity ?? 1) === 1 &&
  node.rotation === 0 &&
  (!node.blendMode || node.blendMode === BlendMode.normal) &&
  !node.pathId &&
  !node.flipX &&
  !node.flipY &&
  !node.strokeWidth &&
  node.content.length > 0 &&
  [...node.content].every((char) => char === '\n' || fontCharacters.has(char.charCodeAt(0)));

export const canExportTextAsRealText = (
  node: TTextNode,
  nodesById: Record<string, TSceneNode>,
  fontCharacters: ReadonlySet<number>,
): boolean => isOwnStyleSupported(node, fontCharacters) && isSafeAncestorChain(node, node.parentId, nodesById, false);
