// others
import { VECTOR_DEFAULT_TANGENT_START_RATIO } from 'constant/canvas';

// types
import { TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

export const getEffectiveTangentStart = (vertices: Record<string, TVectorVertex>, segment: TVectorSegment): TVectorTangent => {
  if (segment.tangentStart) {
    return segment.tangentStart;
  }

  if (segment.tangentEnd) {
    const start = vertices[segment.startId];
    const end = vertices[segment.endId];
    const direction = { x: end.x - start.x + segment.tangentEnd.x, y: end.y - start.y + segment.tangentEnd.y };
    const length = Math.hypot(direction.x, direction.y);

    if (length > 0) {
      const magnitude = Math.hypot(segment.tangentEnd.x, segment.tangentEnd.y) * VECTOR_DEFAULT_TANGENT_START_RATIO;

      return { x: (direction.x / length) * magnitude, y: (direction.y / length) * magnitude };
    }
  }

  return null;
};
