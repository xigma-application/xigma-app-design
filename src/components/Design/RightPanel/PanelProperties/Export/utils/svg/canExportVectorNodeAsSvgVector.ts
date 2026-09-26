// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';
import { getVisibleStrokePaints } from 'utils/canvas/vector/stroke/getVisibleStrokePaints';
import { isSafeAncestorChain } from '../isSafeAncestorChain';
import { isSvgVectorPaint } from './isSvgVectorPaint';

const hasVisibleStroke = (node: TVectorNode): boolean => node.strokeWidth > 0 && getVisibleStrokePaints(node.strokes).length > 0;

const isOwnStyleSupported = (node: TVectorNode): boolean =>
  !node.hidden &&
  (!hasVisibleStroke(node) || !node.widthProfile) &&
  getVisibleStrokePaints(node.strokes).every(isSvgVectorPaint) &&
  groupFilledFacesForRendering(getRenderedVectorNode(node)).every(({ paint }) => paint.every(isSvgVectorPaint));

export const canExportVectorNodeAsSvgVector = (node: TVectorNode, nodesById: Record<string, TSceneNode>): boolean =>
  isOwnStyleSupported(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true, true);
