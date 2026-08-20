// others
import { VECTOR_DEFAULT_TANGENT_PREVIEW_RATIO } from 'constant/canvas';

// types
import { TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

export const getEffectiveTangentEnd = (vertices: Record<string, TVectorVertex>, segment: TVectorSegment): TVectorTangent => {
  if (segment.tangentEnd) {
    return segment.tangentEnd;
  }

  if (segment.tangentStart) {
    const start = vertices[segment.startId];
    const end = vertices[segment.endId];
    const direction = { x: start.x - end.x + segment.tangentStart.x, y: start.y - end.y + segment.tangentStart.y };
    const length = Math.hypot(direction.x, direction.y);

    if (length > 0) {
      const magnitude = Math.hypot(segment.tangentStart.x, segment.tangentStart.y) * VECTOR_DEFAULT_TANGENT_PREVIEW_RATIO;

      return { x: (direction.x / length) * magnitude, y: (direction.y / length) * magnitude };
    }
  }

  return null;
};
