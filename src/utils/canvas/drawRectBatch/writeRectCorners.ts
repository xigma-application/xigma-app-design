// types
import { TRectangleNode } from 'types/design/types';

const HALF = 0.5;

export const writeRectCorners = (node: TRectangleNode, corners: Float32Array): void => {
  const halfWidth = node.width * HALF;
  const halfHeight = node.height * HALF;
  const centerX = node.x + halfWidth;
  const centerY = node.y + halfHeight;
  const radians = (node.rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  for (let index = 0; index < 4; index += 1) {
    const offsetX = index === 0 || index === 3 ? -halfWidth : halfWidth;
    const offsetY = index < 2 ? -halfHeight : halfHeight;

    corners[index * 2] = centerX + offsetX * cos - offsetY * sin;
    corners[index * 2 + 1] = centerY + offsetX * sin + offsetY * cos;
  }
};
