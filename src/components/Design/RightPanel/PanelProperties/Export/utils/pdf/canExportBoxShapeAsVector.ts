// types
import { BlendMode, StrokeMode } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { hasVectorStroke } from './hasVectorStroke';
import { isOpaqueGradientPaint } from './isOpaqueGradientPaint';
import { isPlainPaint } from './isPlainPaint';
import { isSafeAncestorChain } from './isSafeAncestorChain';

const isSupportedPaint = (paint: TPaint): boolean => isPlainPaint(paint) && isOpaqueGradientPaint(paint);

const isOwnStyleSupported = (node: TFrameNode | TRectangleNode): boolean =>
  !node.hidden &&
  (!node.blendMode || node.blendMode === BlendMode.normal) &&
  !node.effects?.some((effect) => effect.visible !== false) &&
  !(node.strokeColor && node.strokeWidth) &&
  (!node.strokeMode || node.strokeMode === StrokeMode.basic) &&
  node.fills.every(isSupportedPaint) &&
  (!hasVectorStroke(node) || (node.strokes ?? []).every(isSupportedPaint));

export const canExportBoxShapeAsVector = (node: TFrameNode | TRectangleNode, nodesById: Record<string, TSceneNode>): boolean =>
  isOwnStyleSupported(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true);
