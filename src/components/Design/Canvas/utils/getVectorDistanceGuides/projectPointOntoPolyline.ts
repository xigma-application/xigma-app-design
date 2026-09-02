// types
import { TPoint } from 'types/canvas';

export type TPolylineProjection = {
  atEndpoint: 'end' | 'start' | null;
  foot: TPoint;
  lengthFromStart: number;
  perpDistance: number;
  totalLength: number;
};

const EPS = 1e-6;

export const projectPointOntoPolyline = (point: TPoint, polyline: TPoint[]): TPolylineProjection => {
  let bestPerp = Infinity;
  let bestFoot = polyline[0];
  let bestLengthFromStart = 0;
  let cumulative = 0;

  for (let index = 0; index < polyline.length - 1; index += 1) {
    const a = polyline[index];
    const b = polyline[index + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const edgeLengthSquared = dx * dx + dy * dy;
    const t = edgeLengthSquared < EPS ? 0 : Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / edgeLengthSquared));
    const foot = { x: a.x + t * dx, y: a.y + t * dy };
    const perp = Math.hypot(point.x - foot.x, point.y - foot.y);

    if (perp < bestPerp) {
      bestPerp = perp;
      bestFoot = foot;
      bestLengthFromStart = cumulative + t * Math.sqrt(edgeLengthSquared);
    }

    cumulative += Math.sqrt(edgeLengthSquared);
  }

  const atEndpoint = bestLengthFromStart <= EPS ? 'start' : bestLengthFromStart >= cumulative - EPS ? 'end' : null;

  return { atEndpoint, foot: bestFoot, lengthFromStart: bestLengthFromStart, perpDistance: bestPerp, totalLength: cumulative };
};
