// types
import { TVertexHandleMode, TVectorSegment, TVectorTangent } from 'types/design/types';

type TOtherHandle = { end: 'tangentEnd' | 'tangentStart'; segmentId: string; tangent: TVectorTangent };

const getOtherHandlesAtVertex = (segments: Record<string, TVectorSegment>, vertexId: string, excludeSegmentId: string): TOtherHandle[] =>
  Object.values(segments)
    .filter((segment) => segment.id !== excludeSegmentId)
    .flatMap((segment) => {
      const handles: TOtherHandle[] = [];

      if (segment.startId === vertexId) {
        handles.push({ end: 'tangentStart', segmentId: segment.id, tangent: segment.tangentStart });
      }

      if (segment.endId === vertexId) {
        handles.push({ end: 'tangentEnd', segmentId: segment.id, tangent: segment.tangentEnd });
      }

      return handles;
    });

const getMirroredTangent = (mode: TVertexHandleMode, tangent: { x: number; y: number }, other: TOtherHandle): TVectorTangent => {
  const otherLength =
    mode === 'symmetric' || !other.tangent ? Math.hypot(tangent.x, tangent.y) : Math.hypot(other.tangent.x, other.tangent.y);
  const angle = Math.atan2(-tangent.y, -tangent.x);

  return { x: Math.cos(angle) * otherLength, y: Math.sin(angle) * otherLength };
};

export const getMirroredVectorSegments = (
  segments: Record<string, TVectorSegment>,
  vertexId: string,
  mode: TVertexHandleMode,
  segmentId: string,
  end: 'tangentEnd' | 'tangentStart',
  tangent: TVectorTangent,
): Record<string, TVectorSegment> => {
  const updated: Record<string, TVectorSegment> = { ...segments, [segmentId]: { ...segments[segmentId], [end]: tangent } };

  if (tangent && (mode === 'smooth' || mode === 'symmetric')) {
    const others = getOtherHandlesAtVertex(segments, vertexId, segmentId);

    if (others.length === 1) {
      const [other] = others;

      updated[other.segmentId] = { ...updated[other.segmentId], [other.end]: getMirroredTangent(mode, tangent, other) };
    }
  }

  return updated;
};
