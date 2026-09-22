// types
import { BlendMode } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { isSafeAncestorChain } from './isSafeAncestorChain';

const isOwnStyleSupported = (node: TTextNode, nodesById: Record<string, TSceneNode>): boolean =>
  !node.hidden &&
  node.rotation === 0 &&
  (!node.blendMode || node.blendMode === BlendMode.normal) &&
  !node.flipX &&
  !node.flipY &&
  !node.strokeWidth &&
  node.content.length > 0 &&
  Boolean(node.pathId && nodesById[node.pathId]);

export const canExportTextOnPathAsVectorCurves = (
  node: TTextNode,
  nodesById: Record<string, TSceneNode>,
  allowBlendMode: boolean,
): boolean => isOwnStyleSupported(node, nodesById) && isSafeAncestorChain(node, node.parentId, nodesById, true, allowBlendMode);
