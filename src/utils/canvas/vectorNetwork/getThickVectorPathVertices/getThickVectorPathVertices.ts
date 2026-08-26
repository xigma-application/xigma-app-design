// types
import { TFlattenedVectorSegment } from '../flattenVectorSegments';

// utils
import { collectVectorPathVertexEndpoints } from './collectVectorPathVertexEndpoints';
import { getThickPolylineVertices } from '../getThickPolylineVertices';
import { getVectorPathJoinVertices } from './getVectorPathJoinVertices';

type TCacheEntry = { halfWidth: number; vertices: number[] };

const cache = new WeakMap<TFlattenedVectorSegment[], TCacheEntry>();

export const getThickVectorPathVertices = (segments: TFlattenedVectorSegment[], halfWidth: number): number[] => {
  const cached = cache.get(segments);

  if (cached && cached.halfWidth === halfWidth) {
    return cached.vertices;
  }

  const segmentVertices = segments.flatMap(({ points }) => getThickPolylineVertices(points, halfWidth));
  const endpointsByVertexId = collectVectorPathVertexEndpoints(segments, halfWidth);
  const vertexJoinVertices = getVectorPathJoinVertices(endpointsByVertexId, halfWidth);
  const vertices = [...segmentVertices, ...vertexJoinVertices];

  cache.set(segments, { halfWidth, vertices });

  return vertices;
};
