// types
import { NodeType } from 'types/design/enums';
import { TSceneNodeHitContext } from './types';

// utils
import { getStrokeExpandedNode } from './getStrokeExpandedNode';
import { isPointInCurvedText } from '../isPointInCurvedText';
import { isPointInEllipse } from '../isPointInEllipse';
import { isPointInPolygon } from '../isPointInPolygon';
import { isPointInRect } from '../isPointInRect';
import { isPointInStar } from '../isPointInStar';
import { isPointInText } from '../isPointInText';
import { isPointNearLine } from '../isPointNearLine';
import { isPointOnVectorNode } from './isPointOnVectorNode';

export const isPointOnSceneNode = (context: TSceneNodeHitContext): boolean => {
  const { lineTolerance, node, nodesById, pathTextTolerance, point, testPoint, textPathBoundVectorIds, zoom } = context;

  switch (node.type) {
    case NodeType.ellipse:
      return isPointInEllipse(testPoint, getStrokeExpandedNode(node));
    case NodeType.polygon:
      return isPointInPolygon(testPoint, node);
    case NodeType.star:
      return isPointInStar(testPoint, node);
    case NodeType.line:
      return isPointNearLine(testPoint, node, Math.max(lineTolerance, (node.strokeWidth ?? 0) / 2 / zoom));
    case NodeType.text:
      return node.pathId ? isPointInCurvedText(point, node, pathTextTolerance, nodesById[node.pathId]) : isPointInText(testPoint, node);
    case NodeType.path:
      return false;
    case NodeType.vector:
      return isPointOnVectorNode(testPoint, node, lineTolerance, textPathBoundVectorIds);
    default:
      return isPointInRect(testPoint, getStrokeExpandedNode(node));
  }
};
