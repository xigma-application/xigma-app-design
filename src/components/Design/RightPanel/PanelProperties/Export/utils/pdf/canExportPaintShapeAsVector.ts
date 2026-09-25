// types
import { BlendMode } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TSceneNode, TStarNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { hasVectorStroke } from '../hasVectorStroke';
import { isPlainPaint } from './isPlainPaint';
import { isSafeAncestorChain } from '../isSafeAncestorChain';

const isOwnStyleSupported = (node: TEllipseNode | TPolygonNode | TStarNode): boolean =>
  !node.hidden &&
  (!node.blendMode || node.blendMode === BlendMode.normal) &&
  !node.effects?.some((effect) => effect.visible !== false) &&
  node.fills.every(isPlainPaint) &&
  (!hasVectorStroke(node) || (node.strokes ?? []).every(isPlainPaint));

export const canExportPaintShapeAsVector = (
  node: TEllipseNode | TPolygonNode | TStarNode,
  nodesById: Record<string, TSceneNode>,
): boolean => isOwnStyleSupported(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true, false);
