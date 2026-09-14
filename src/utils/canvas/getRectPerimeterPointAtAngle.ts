// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getRectPerimeterPointAtAngle = (bounds: TDraftRect, angle: number): TPoint => {
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;
  const center: TPoint = { x: bounds.x + halfWidth, y: bounds.y + halfHeight };
  const directionX = Math.cos(angle);
  const directionY = Math.sin(angle);
  const scaleToVerticalEdge = directionX === 0 ? Infinity : halfWidth / Math.abs(directionX);
  const scaleToHorizontalEdge = directionY === 0 ? Infinity : halfHeight / Math.abs(directionY);
  const scale = Math.min(scaleToVerticalEdge, scaleToHorizontalEdge);

  return { x: center.x + directionX * scale, y: center.y + directionY * scale };
};
