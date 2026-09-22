// types
import { BlendMode } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TSceneNode, TStarNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isSafeAncestorChain } from './isSafeAncestorChain';

const isOwnStyleSupported = (node: TEllipseNode | TPolygonNode | TStarNode): boolean =>
  !node.hidden && (!node.blendMode || node.blendMode === BlendMode.normal);

export const canExportSimpleShapeAsVector = (
  node: TEllipseNode | TPolygonNode | TStarNode,
  nodesById: Record<string, TSceneNode>,
): boolean => isOwnStyleSupported(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true);
