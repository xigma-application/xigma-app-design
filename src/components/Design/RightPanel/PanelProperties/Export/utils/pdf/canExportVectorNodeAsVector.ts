// types
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';
import { isOpaqueGradientPaint } from './isOpaqueGradientPaint';
import { isPlainPaint } from './isPlainPaint';
import { isSafeAncestorChain } from './isSafeAncestorChain';

const isSupportedPaint = (paint: TPaint): boolean => isPlainPaint(paint) && isOpaqueGradientPaint(paint);

const hasVisibleStroke = (node: TVectorNode): boolean => Boolean(node.strokeWidth > 0 && node.strokeColor);

const isOwnStyleSupported = (node: TVectorNode): boolean =>
  !node.hidden &&
  (!hasVisibleStroke(node) || !node.widthProfile) &&
  groupFilledFacesForRendering(getRenderedVectorNode(node)).every(({ paint }) => paint.every(isSupportedPaint));

export const canExportVectorNodeAsVector = (node: TVectorNode, nodesById: Record<string, TSceneNode>): boolean =>
  isOwnStyleSupported(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true);
