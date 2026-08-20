// types
import { TFlattenedVectorSegment } from '../flattenVectorSegments';
import { TPoint } from 'types/canvas';

// utils
import { getPolylineSegmentOffset } from '../getPolylineSegmentOffset';

export type TVertexEndpoint = { direction: 'incoming' | 'outgoing'; offset: TPoint; point: TPoint };

const getEndpointOffset = (points: TPoint[], atStart: boolean, halfWidth: number): TPoint | null =>
  atStart
    ? getPolylineSegmentOffset(points[0], points[1], halfWidth)
    : getPolylineSegmentOffset(points[points.length - 2], points[points.length - 1], halfWidth);

const addEndpoint = (endpointsByVertexId: Map<string, TVertexEndpoint[]>, vertexId: string, endpoint: TVertexEndpoint): void => {
  const endpoints = endpointsByVertexId.get(vertexId) ?? [];

  endpoints.push(endpoint);
  endpointsByVertexId.set(vertexId, endpoints);
};

export const collectVectorPathVertexEndpoints = (
  segments: TFlattenedVectorSegment[],
  halfWidth: number,
): Map<string, TVertexEndpoint[]> => {
  const endpointsByVertexId = new Map<string, TVertexEndpoint[]>();

  segments.forEach(({ endId, points, startId }) => {
    const startOffset = getEndpointOffset(points, true, halfWidth);
    const endOffset = getEndpointOffset(points, false, halfWidth);

    if (startOffset) {
      addEndpoint(endpointsByVertexId, startId, { direction: 'outgoing', offset: startOffset, point: points[0] });
    }

    if (endOffset) {
      addEndpoint(endpointsByVertexId, endId, { direction: 'incoming', offset: endOffset, point: points[points.length - 1] });
    }
  });

  return endpointsByVertexId;
};
