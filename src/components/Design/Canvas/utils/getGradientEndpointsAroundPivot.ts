// types
import { TPoint } from 'types/canvas';

export const getGradientEndpointsAroundPivot = (pivot: TPoint, radius: number, angle: number): { end: TPoint; start: TPoint } => {
  const direction: TPoint = { x: Math.cos(angle), y: Math.sin(angle) };

  return {
    end: { x: pivot.x - direction.x * radius, y: pivot.y - direction.y * radius },
    start: { x: pivot.x + direction.x * radius, y: pivot.y + direction.y * radius },
  };
};
