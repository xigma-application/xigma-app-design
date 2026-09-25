// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TEllipseNode } from 'types/design/types';
import { TRectBatch } from './types';

// utils
import { getEllipsePoints } from 'utils/canvas/shapes/getEllipsePoints';
import { getSolidFillColor } from './getSolidFillColor';
import { pushPolygonFan } from './pushPolygonFan';
import { rotatePoint } from 'utils/math/rotatePoint';

export const appendEllipseFan = (batch: TRectBatch, node: TEllipseNode, opacity: number): void => {
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const points = getEllipsePoints(node, ELLIPSE_SEGMENTS).map((point) => rotatePoint(point, center, node.rotation));

  for (let index = node.fills.length - 1; index >= 0; index -= 1) {
    const paint = node.fills[index];

    if (paint.type === 'solid' && paint.visible !== false) {
      pushPolygonFan(batch, center, points, getSolidFillColor(paint.color), (paint.opacity * opacity) / 100);
    }
  }
};
