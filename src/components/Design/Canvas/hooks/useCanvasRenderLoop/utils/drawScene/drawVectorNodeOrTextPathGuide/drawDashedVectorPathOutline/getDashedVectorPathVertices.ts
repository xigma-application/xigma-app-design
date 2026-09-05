// types
import { TVectorChainArcLengthSample } from 'utils/canvas/vectorNetwork/getVectorChainArcLengthTable';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorChainPositionAtLength } from 'utils/canvas/vectorNetwork/getVectorChainPositionAtLength';
import { getVectorSegmentPointAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentPointAtT';

export const getDashedVectorPathVertices = (
  renderedNode: TVectorNode,
  table: TVectorChainArcLengthSample[],
  totalLength: number,
  zoom: number,
  dashLength: number,
  dashGap: number,
): number[] => {
  const patternLength = (dashLength + dashGap) / zoom;
  const dashCount = Math.max(1, Math.round(totalLength / patternLength));
  const segmentLength = totalLength / dashCount;
  const dashRatio = dashLength / (dashLength + dashGap);

  const worldAtLength = (length: number): { x: number; y: number } => {
    const { segmentId, t } = getVectorChainPositionAtLength(table, length);
    return getVectorSegmentPointAtT(renderedNode, renderedNode.segments[segmentId], t);
  };

  return Array.from({ length: dashCount }, (_, index) => {
    const start = index * segmentLength;
    const end = start + segmentLength * dashRatio;
    const startPoint = worldAtLength(start);
    const endPoint = worldAtLength(end);

    return [startPoint.x, startPoint.y, endPoint.x, endPoint.y];
  }).flat();
};
