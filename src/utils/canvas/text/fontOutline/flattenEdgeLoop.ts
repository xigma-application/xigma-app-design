// types
import { TPoint } from 'types/canvas';

// utils
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getVectorCurveSegmentCount } from 'utils/canvas/vectorNetwork/getVectorCurveSegmentCount';
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

export const flattenEdgeLoop = (edges: TLoopEdge[]): TPoint[] => {
  const points = edges.flatMap((edge, index) => {
    const segmentCount = getVectorCurveSegmentCount(edge.start, edge.end, edge.tangentStart, edge.tangentEnd);
    const segmentPoints = flattenSegment(edge.start, edge.end, edge.tangentStart, edge.tangentEnd, segmentCount);

    return index > 0 ? segmentPoints.slice(1) : segmentPoints;
  });

  return points.slice(0, -1);
};
