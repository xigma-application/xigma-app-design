// types
import { TPoint } from 'types/canvas';

// utils
import { getStraightSegmentIntersection } from 'utils/canvas/vectorNetwork/planarizeVectorNetwork/getStraightSegmentIntersection';

export type TLoopPiece = { end: TPoint; start: TPoint };

type TCut = { point: TPoint; t: number };

const TOUCH_EPSILON = 1e-4;

const getTouchParameter = (point: TPoint, from: TPoint, to: TPoint): number | null => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared;
  const distance = Math.hypot(from.x + dx * t - point.x, from.y + dy * t - point.y);
  const margin = TOUCH_EPSILON / Math.sqrt(lengthSquared);

  return t > margin && t < 1 - margin && distance < TOUCH_EPSILON ? t : null;
};

export const splitLoopAtCrossings = (loop: TPoint[]): TLoopPiece[] => {
  const count = loop.length;
  const cuts: TCut[][] = loop.map(() => []);

  for (let i = 0; i < count; i += 1) {
    for (let j = i + 2; j < count; j += 1) {
      if ((j + 1) % count !== i) {
        const crossing = getStraightSegmentIntersection(loop[i], loop[(i + 1) % count], loop[j], loop[(j + 1) % count]);

        if (crossing) {
          cuts[i].push({ point: crossing.point, t: crossing.t });
          cuts[j].push({ point: crossing.point, t: crossing.u });
        }
      }
    }

    loop.forEach((point, index) => {
      const t = index === i || index === (i + 1) % count ? null : getTouchParameter(point, loop[i], loop[(i + 1) % count]);

      if (t !== null) {
        cuts[i].push({ point, t });
      }
    });
  }

  return loop.flatMap((start, index) => {
    const stops = [...cuts[index].sort((a, b) => a.t - b.t).map(({ point }) => point), loop[(index + 1) % count]];
    return stops.map((end, stopIndex) => ({ end, start: stopIndex === 0 ? start : stops[stopIndex - 1] }));
  });
};
