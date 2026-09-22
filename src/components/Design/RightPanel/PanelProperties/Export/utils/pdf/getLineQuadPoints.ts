// types
import { TLineSegment, TPoint } from 'types/canvas';

export const getLineQuadPoints = (line: TLineSegment, strokeWidth: number): TPoint[] => {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.hypot(dx, dy);

  if (length !== 0) {
    const halfWidth = strokeWidth / 2;
    const offsetX = (-dy / length) * halfWidth;
    const offsetY = (dx / length) * halfWidth;

    return [
      { x: line.x1 + offsetX, y: line.y1 + offsetY },
      { x: line.x2 + offsetX, y: line.y2 + offsetY },
      { x: line.x2 - offsetX, y: line.y2 - offsetY },
      { x: line.x1 - offsetX, y: line.y1 - offsetY },
    ];
  }

  return [];
};
