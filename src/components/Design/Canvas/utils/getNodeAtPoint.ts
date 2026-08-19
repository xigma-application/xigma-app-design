// others
import { LINE_HIT_TOLERANCE_PX, PATH_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { isPointInCurvedText } from './isPointInCurvedText';
import { isPointInEllipse } from './isPointInEllipse';
import { isPointInPolygon } from './isPointInPolygon';
import { isPointInRect } from './isPointInRect';
import { isPointInStar } from './isPointInStar';
import { isPointInText } from './isPointInText';
import { isPointInVectorRegions } from './isPointInVectorRegions';
import { isPointNearLine } from './isPointNearLine';
import { isPointNearVectorPath } from './isPointNearVectorPath';
import { rotatePoint } from 'utils/math/rotatePoint';

const getUnrotatedQueryPoint = (point: TPoint, node: TSceneNode): TPoint => {
  if (node.type === NodeType.line || node.type === NodeType.vector || node.rotation === 0) {
    return point;
  }

  const bounds = getNodeBounds(node);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return rotatePoint(point, center, -node.rotation);
};

export const getNodeAtPoint = (point: TPoint, nodes: TSceneNode[], viewport: TViewport): TSceneNode | null => {
  const lineTolerance = LINE_HIT_TOLERANCE_PX / viewport.zoom;
  const pathTextTolerance = PATH_TEXT_HIT_TOLERANCE_PX / viewport.zoom;

  const hit = [...nodes].reverse().find((node) => {
    const testPoint = getUnrotatedQueryPoint(point, node);

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
        return node.pathId ? isPointInCurvedText(point, node, pathTextTolerance) : isPointInText(testPoint, node);
      case NodeType.path:
        return false;
      case NodeType.vector:
        return isPointInVectorRegions(testPoint, node) || isPointNearVectorPath(testPoint, node, lineTolerance);
      default:
        return isPointInRect(testPoint, node);
    }
  });

  return hit ?? null;
};
