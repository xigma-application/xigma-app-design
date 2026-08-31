// types
import { TPoint } from 'types/canvas';

// utils
import { TFlattenedVectorSegment } from '../flattenVectorSegments';

export const walkChain = (
  startVertexId: string,
  adjacency: Map<string, TFlattenedVectorSegment[]>,
  totalSegmentCount: number,
): TPoint[] | null => {
  const visited = new Set<string>();
  const orderedPoints: TPoint[] = [];
  let currentVertexId = startVertexId;

  while (visited.size < totalSegmentCount) {
    const nextSegment = (adjacency.get(currentVertexId) ?? []).find((segment) => !visited.has(segment.segmentId));

    if (!nextSegment) {
      return null;
    }

    visited.add(nextSegment.segmentId);

    const forward = nextSegment.startId === currentVertexId;
    const points = forward ? nextSegment.points : [...nextSegment.points].reverse();

    orderedPoints.push(...(orderedPoints.length > 0 ? points.slice(1) : points));
    currentVertexId = forward ? nextSegment.endId : nextSegment.startId;
  }

  return orderedPoints;
};
