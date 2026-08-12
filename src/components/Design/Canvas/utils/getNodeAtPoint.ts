// others
import { LINE_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { isPointInEllipse } from './isPointInEllipse';
import { isPointInPolygon } from './isPointInPolygon';
import { isPointInRect } from './isPointInRect';
import { isPointInStar } from './isPointInStar';
import { isPointInText } from './isPointInText';
import { isPointNearLine } from './isPointNearLine';

export const getNodeAtPoint = (point: TPoint, nodes: TSceneNode[], viewport: TViewport): TSceneNode | null => {
  const lineTolerance = LINE_HIT_TOLERANCE_PX / viewport.zoom;

  const hit = [...nodes].reverse().find((node) => {
    switch (node.type) {
      case NodeType.ellipse:
        return isPointInEllipse(point, node);
      case NodeType.polygon:
        return isPointInPolygon(point, node);
      case NodeType.star:
        return isPointInStar(point, node);
      case NodeType.line:
        return isPointNearLine(point, node, lineTolerance);
      case NodeType.text:
        return isPointInText(point, node);
      default:
        return isPointInRect(point, node);
    }
  });

  return hit ?? null;
};
