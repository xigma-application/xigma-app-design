// types
import { TFlattenedVectorSegment } from '../flattenVectorSegments';
import { TVectorNodeCluster } from '../getVectorNodeClusters/types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenSegment } from '../flattenSegment';
import { getVectorCurveSegmentCount } from '../getVectorCurveSegmentCount';

export const flattenClusterSegments = (
  cluster: TVectorNodeCluster,
  segments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
): TFlattenedVectorSegment[] =>
  cluster.segmentIds.map((id) => {
    const segment = segments[id];
    const start = vertices[segment.startId];
    const end = vertices[segment.endId];

    return {
      endId: segment.endId,
      points: flattenSegment(
        start,
        end,
        segment.tangentStart,
        segment.tangentEnd,
        getVectorCurveSegmentCount(start, end, segment.tangentStart, segment.tangentEnd),
      ),
      segmentId: segment.id,
      startId: segment.startId,
    };
  });
