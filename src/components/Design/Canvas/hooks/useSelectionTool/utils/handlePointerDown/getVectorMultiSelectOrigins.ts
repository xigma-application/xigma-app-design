// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getEffectiveTangentEnd } from 'utils/canvas/vectorNetwork/getEffectiveTangentEnd';
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';

export const getVectorHandleOriginKey = (handle: TVectorHandleHover): string => `${handle.end}:${handle.segmentId}`;

export type TVectorMultiSelectOrigins = { handleOrigins: Record<string, TPoint>; vertexOrigins: Record<string, TPoint> };

export const getVectorMultiSelectOrigins = (
  node: TVectorNode,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
): TVectorMultiSelectOrigins => {
  const vertexOrigins = Object.fromEntries(
    selectedVertexIds.map((vertexId) => [vertexId, { x: node.vertices[vertexId].x, y: node.vertices[vertexId].y }]),
  );
  const handleOrigins = Object.fromEntries(
    selectedHandles.flatMap((handle) => {
      const segment = node.segments[handle.segmentId];
      const tangent =
        handle.end === 'start' ? getEffectiveTangentStart(node.vertices, segment) : getEffectiveTangentEnd(node.vertices, segment);

      return tangent ? [[getVectorHandleOriginKey(handle), tangent]] : [];
    }),
  );

  return { handleOrigins, vertexOrigins };
};
