// types
import { TRectangleNode } from 'types/design/types';
import { TRectBatch } from './types';

// utils
import { getSolidFillColor } from './getSolidFillColor';
import { getUniformRingPolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/getUniformRingPolygons';
import { pushRingStrip } from './pushRingStrip';

export const appendRectangleStroke = (batch: TRectBatch, node: TRectangleNode, opacity: number): void => {
  if (node.strokes && node.strokes.length > 0 && node.strokeWidth) {
    const [outer, inner] = getUniformRingPolygons(node);

    for (let index = node.strokes.length - 1; index >= 0; index -= 1) {
      const paint = node.strokes[index];

      if (paint.type === 'solid' && paint.visible !== false) {
        pushRingStrip(batch, outer, inner, getSolidFillColor(paint.color), (paint.opacity * opacity) / 100);
      }
    }
  }
};
