// types
import { TNetworkCrossings } from './types';
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { findSegmentCrossings } from '../findSegmentCrossings';
import { refineCrossing } from '../refineCrossing';

export const addCrossingsForPair = (
  a: TVectorSegment,
  b: TVectorSegment,
  pointsA: TPoint[],
  pointsB: TPoint[],
  vertices: Record<string, TVectorVertex>,
  crossingsBySegmentId: TNetworkCrossings['crossingsBySegmentId'],
  virtualVertices: TNetworkCrossings['virtualVertices'],
  segmentIdsByVertexId: Map<string, [string, string]>,
): void => {
  findSegmentCrossings(pointsA, pointsB).forEach((coarseCrossing) => {
    const crossing = refineCrossing(
      a,
      b,
      vertices,
      coarseCrossing.tA,
      1 / (pointsA.length - 1),
      coarseCrossing.tB,
      1 / (pointsB.length - 1),
    );
    const [firstId, secondId] = [a.id, b.id].sort();
    const vertexId = `x:${firstId}:${secondId}:${crossing.tA.toFixed(6)}`;

    virtualVertices[vertexId] = { id: vertexId, x: crossing.point.x, y: crossing.point.y };
    crossingsBySegmentId.set(a.id, [...(crossingsBySegmentId.get(a.id) ?? []), { t: crossing.tA, vertexId }]);
    crossingsBySegmentId.set(b.id, [...(crossingsBySegmentId.get(b.id) ?? []), { t: crossing.tB, vertexId }]);
    segmentIdsByVertexId.set(vertexId, [a.id, b.id]);
  });
};
