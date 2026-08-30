// others
import { LINE_HIT_TOLERANCE_PX, PATH_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodesById } from './getNodesById';
import { getTextPathBoundVectorIds } from './getTextPathBoundVectorIds';
import { getUnrotatedNodeQueryPoint } from './getUnrotatedNodeQueryPoint';
import { isPointInCurvedText } from '../isPointInCurvedText';
import { isPointInEllipse } from '../isPointInEllipse';
import { isPointInPolygon } from '../isPointInPolygon';
import { isPointInRect } from '../isPointInRect';
import { isPointInStar } from '../isPointInStar';
import { isPointInText } from '../isPointInText';
import { isPointNearLine } from '../isPointNearLine';
import { isPointOnVectorNode } from './isPointOnVectorNode';

export const getNodeAtPoint = (point: TPoint, nodes: TSceneNode[], viewport: TViewport): TSceneNode | null => {
  const lineTolerance = LINE_HIT_TOLERANCE_PX / viewport.zoom;
  const pathTextTolerance = PATH_TEXT_HIT_TOLERANCE_PX / viewport.zoom;
  const nodesById = getNodesById(nodes);
  const textPathBoundVectorIds = getTextPathBoundVectorIds(nodes);

  const hit = [...nodes].reverse().find((node) => {
    if (!node.hidden && !node.locked) {
      const testPoint = getUnrotatedNodeQueryPoint(point, node);

      switch (node.type) {
        case NodeType.ellipse:
          return isPointInEllipse(testPoint, node);
        case NodeType.polygon:
          return isPointInPolygon(testPoint, node);
        case NodeType.star:
          return isPointInStar(testPoint, node);
        case NodeType.line:
          return isPointNearLine(testPoint, node, lineTolerance);
        case NodeType.text:
          return node.pathId ? isPointInCurvedText(point, node, pathTextTolerance, nodesById[node.pathId]) : isPointInText(testPoint, node);
        case NodeType.path:
          return false;
        case NodeType.vector:
          return isPointOnVectorNode(testPoint, node, lineTolerance, textPathBoundVectorIds);
        default:
          return isPointInRect(testPoint, node);
      }
    }

    return false;
  });

  return hit ?? null;
};
