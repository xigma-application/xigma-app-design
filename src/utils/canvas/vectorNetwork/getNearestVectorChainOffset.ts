// types
import { TPoint } from 'types/canvas';
import { TVectorChainArcLengthSample } from './getVectorChainArcLengthTable';
import { TVectorNode } from 'types/design/types';

// utils
import { getClosestPointOnLine } from 'components/Design/Canvas/utils/getClosestPointOnLine';
import { getVectorSegmentPointAtT } from './getVectorSegmentPointAtT';

export type TNearestVectorChainOffset = {
  distance: number;
  offset: number;
  point: TPoint;
};

export const getNearestVectorChainOffset = (
  node: TVectorNode,
  table: TVectorChainArcLengthSample[],
  point: TPoint,
): TNearestVectorChainOffset => {
  const totalLength = table[table.length - 1]?.length ?? 0;
  const worldAt = (sample: TVectorChainArcLengthSample): TPoint =>
    getVectorSegmentPointAtT(node, node.segments[sample.segmentId], sample.t);

  let best: TNearestVectorChainOffset = { distance: Infinity, offset: 0, point: worldAt(table[0]) };

  for (let index = 1; index < table.length; index += 1) {
    const lower = table[index - 1];
    const upper = table[index];
    const from = worldAt(lower);
    const to = worldAt(upper);
    const closest = getClosestPointOnLine(point, { x1: from.x, x2: to.x, y1: from.y, y2: to.y });
    const distance = Math.hypot(point.x - closest.point.x, point.y - closest.point.y);

    if (distance < best.distance) {
      const length = lower.length + (upper.length - lower.length) * closest.t;

      best = { distance, offset: totalLength > 0 ? length / totalLength : 0, point: closest.point };
    }
  }

  return best;
};
