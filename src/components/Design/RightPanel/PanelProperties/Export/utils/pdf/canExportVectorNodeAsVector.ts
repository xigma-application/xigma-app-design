// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';
import { isPlainPaint } from './isPlainPaint';
import { getVisibleStrokePaints } from 'utils/canvas/vector/stroke/getVisibleStrokePaints';
import { isSafeAncestorChain } from '../isSafeAncestorChain';

const hasVisibleStroke = (node: TVectorNode): boolean => node.strokeWidth > 0 && getVisibleStrokePaints(node.strokes).length > 0;

const isOwnStyleSupported = (node: TVectorNode): boolean =>
  !node.hidden &&
  !node.effects?.some((effect) => effect.visible !== false) &&
  (!hasVisibleStroke(node) || !node.widthProfile) &&
  getVisibleStrokePaints(node.strokes).every(isPlainPaint) &&
  groupFilledFacesForRendering(getRenderedVectorNode(node)).every(({ paint }) => paint.every(isPlainPaint));

export const canExportVectorNodeAsVector = (node: TVectorNode, nodesById: Record<string, TSceneNode>): boolean =>
  isOwnStyleSupported(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true, false);
