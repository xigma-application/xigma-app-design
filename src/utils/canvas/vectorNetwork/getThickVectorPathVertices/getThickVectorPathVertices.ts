// types
import { TFlattenedVectorSegment } from '../flattenVectorSegments';

// utils
import { collectVectorPathVertexEndpoints } from './collectVectorPathVertexEndpoints';
import { getThickPolylineVertices } from '../getThickPolylineVertices';
import { getVectorPathJoinVertices } from './getVectorPathJoinVertices';

export const getThickVectorPathVertices = (segments: TFlattenedVectorSegment[], halfWidth: number): number[] => {
  const segmentVertices = segments.flatMap(({ points }) => getThickPolylineVertices(points, halfWidth));
  const endpointsByVertexId = collectVectorPathVertexEndpoints(segments, halfWidth);
  const vertexJoinVertices = getVectorPathJoinVertices(endpointsByVertexId, halfWidth);

  return [...segmentVertices, ...vertexJoinVertices];
};
