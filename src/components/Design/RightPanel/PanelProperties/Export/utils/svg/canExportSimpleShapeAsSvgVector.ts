// types
import { BlendMode } from 'types/design/enums';
import { TPolygonNode, TSceneNode, TStarNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isSafeAncestorChain } from '../isSafeAncestorChain';

const isOwnStyleSupported = (node: TPolygonNode | TStarNode): boolean =>
  !node.hidden && (!node.blendMode || node.blendMode === BlendMode.normal);

export const canExportSimpleShapeAsSvgVector = (node: TPolygonNode | TStarNode, nodesById: Record<string, TSceneNode>): boolean =>
  isOwnStyleSupported(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true, true);
