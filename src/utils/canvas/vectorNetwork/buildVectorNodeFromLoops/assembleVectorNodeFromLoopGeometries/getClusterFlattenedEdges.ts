// types
import { TPoint } from 'types/canvas';
import { TPlanarVectorNetwork } from 'utils/canvas/vectorNetwork/planarizeVectorNetwork/types';
import { TVectorNodeCluster } from 'utils/canvas/vectorNetwork/getVectorNodeClusters/types';

// utils
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getVectorCurveSegmentCount } from 'utils/canvas/vectorNetwork/getVectorCurveSegmentCount';

export const getClusterFlattenedEdges = (cluster: TVectorNodeCluster, planar: TPlanarVectorNetwork): [TPoint, TPoint][] =>
  cluster.segmentIds.flatMap((segmentId) => {
    const segment = planar.segments[segmentId];
    const start = planar.vertices[segment.startId];
    const end = planar.vertices[segment.endId];
    const points = flattenSegment(
      start,
      end,
      segment.tangentStart,
      segment.tangentEnd,
      getVectorCurveSegmentCount(start, end, segment.tangentStart, segment.tangentEnd),
    );

    return points.slice(0, -1).map((point, index): [TPoint, TPoint] => [point, points[index + 1]]);
  });
