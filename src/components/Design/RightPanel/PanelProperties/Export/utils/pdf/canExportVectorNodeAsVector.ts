// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';
import { isPlainSolidPaint } from './isPlainSolidPaint';
import { isSafeAncestorChain } from './isSafeAncestorChain';

const hasVisibleStroke = (node: TVectorNode): boolean => Boolean(node.strokeWidth > 0 && node.strokeColor);

const isOwnStyleSupported = (node: TVectorNode): boolean =>
  !node.hidden &&
  (!hasVisibleStroke(node) || !node.widthProfile) &&
  groupFilledFacesForRendering(getRenderedVectorNode(node)).every(({ paint }) => paint.every(isPlainSolidPaint));

export const canExportVectorNodeAsVector = (node: TVectorNode, nodesById: Record<string, TSceneNode>): boolean =>
  isOwnStyleSupported(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true);
