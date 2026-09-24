// types
import { TRectangleNode } from 'types/design/types';
import { TRectBatch } from './types';

// utils
import { getSolidFillColor } from './getSolidFillColor';
import { pushRectQuad } from './pushRectQuad';
import { writeRectCorners } from './writeRectCorners';

const corners = new Float32Array(8);

export const appendRectangleQuads = (batch: TRectBatch, node: TRectangleNode, opacity: number): void => {
  writeRectCorners(node, corners);

  for (let index = node.fills.length - 1; index >= 0; index -= 1) {
    const paint = node.fills[index];

    if (paint.type === 'solid' && paint.visible !== false) {
      pushRectQuad(batch, corners, getSolidFillColor(paint.color), (paint.opacity * opacity) / 100);
    }
  }
};
