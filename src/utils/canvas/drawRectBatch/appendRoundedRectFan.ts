// types
import { TRectangleNode } from 'types/design/types';
import { TRectBatch } from './types';

// utils
import { getBoxFillPolygon } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxFillPolygon';
import { getSolidFillColor } from './getSolidFillColor';
import { pushPolygonFan } from './pushPolygonFan';

export const appendRoundedRectFan = (batch: TRectBatch, node: TRectangleNode, opacity: number): void => {
  const polygon = getBoxFillPolygon(node);
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };

  for (let index = node.fills.length - 1; index >= 0; index -= 1) {
    const paint = node.fills[index];

    if (paint.type === 'solid' && paint.visible !== false) {
      pushPolygonFan(batch, center, polygon, getSolidFillColor(paint.color), (paint.opacity * opacity) / 100);
    }
  }
};
