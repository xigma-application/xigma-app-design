// types
import { BlendMode } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { isSafeAncestorChain } from '../isSafeAncestorChain';

const isOwnStyleSupported = (node: TTextNode): boolean =>
  !node.hidden &&
  node.rotation === 0 &&
  (!node.blendMode || node.blendMode === BlendMode.normal) &&
  !node.pathId &&
  !node.flipX &&
  !node.flipY &&
  !node.strokeWidth &&
  node.content.length > 0;

export const canExportTextAsSvgRealText = (node: TTextNode, nodesById: Record<string, TSceneNode>): boolean =>
  isOwnStyleSupported(node) && isSafeAncestorChain(node, node.parentId, nodesById, true, true);
