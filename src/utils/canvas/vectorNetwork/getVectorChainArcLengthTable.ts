// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVectorChainOrder } from './getVectorChainOrder/getVectorChainOrder';

// utils
import { getVectorCurveSegmentCount } from './getVectorCurveSegmentCount';
import { getVectorSegmentPointAtT } from './getVectorSegmentPointAtT';

export type TVectorChainArcLengthSample = { length: number; segmentId: string; t: number };

const getSegmentSampleTs = (node: TVectorNode, segmentId: string, extraTs: number[]): number[] => {
  const segment = node.segments[segmentId];
  const start = node.vertices[segment.startId];
  const end = node.vertices[segment.endId];
  const segmentCount = getVectorCurveSegmentCount(start, end, segment.tangentStart, segment.tangentEnd);
  const evenTs = Array.from({ length: segmentCount + 1 }, (_, index) => index / segmentCount);

  return [...new Set([...evenTs, ...extraTs])].sort((a, b) => a - b);
};

export const getVectorChainArcLengthTable = (
  node: TVectorNode,
  chainOrder: TVectorChainOrder,
  extraSegmentTs: Record<string, number[]> = {},
): TVectorChainArcLengthSample[] => {
  const samples: TVectorChainArcLengthSample[] = [];
  let cumulativeLength = 0;
  let previousPoint: TPoint | null = null;

  chainOrder.entries.forEach((entry, entryIndex) => {
    const segment = node.segments[entry.segmentId];
    const sampleTs = getSegmentSampleTs(node, entry.segmentId, extraSegmentTs[entry.segmentId] ?? []);
    const orderedTs = entry.reversed ? [...sampleTs].reverse() : sampleTs;

    orderedTs.forEach((t, walkIndex) => {
      if (entryIndex > 0 && walkIndex === 0) {
        return;
      }

      const point = getVectorSegmentPointAtT(node, segment, t);

      if (previousPoint) {
        cumulativeLength += Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
      }

      previousPoint = point;
      samples.push({ length: cumulativeLength, segmentId: entry.segmentId, t });
    });
  });

  return samples;
};
