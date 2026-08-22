// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForSegment } from '../../../../utils/findVectorEditingNodeForSegment';
import { findVectorEditingNodeForVertex } from '../../../../utils/findVectorEditingNodeForVertex';
import { getEffectiveTangentEnd } from 'utils/canvas/vectorNetwork/getEffectiveTangentEnd';
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';

export const getVectorHandleOriginKey = (handle: TVectorHandleHover): string => `${handle.end}:${handle.segmentId}`;

export type TVectorMultiSelectOrigins = { handleOrigins: Record<string, TPoint>; vertexOrigins: Record<string, TPoint> };

export const getVectorMultiSelectOrigins = (
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
): TVectorMultiSelectOrigins => {
  const vertexOrigins = Object.fromEntries(
    selectedVertexIds.flatMap((vertexId) => {
      const node = findVectorEditingNodeForVertex(vectorEditingNodeIds, nodes, vertexId);
      const vertex = node?.vertices[vertexId];

      return vertex ? [[vertexId, { x: vertex.x, y: vertex.y }]] : [];
    }),
  );
  const handleOrigins = Object.fromEntries(
    selectedHandles.flatMap((handle) => {
      const node = findVectorEditingNodeForSegment(vectorEditingNodeIds, nodes, handle.segmentId);
      const segment = node?.segments[handle.segmentId];
      const tangent =
        segment &&
        (handle.end === 'start' ? getEffectiveTangentStart(node.vertices, segment) : getEffectiveTangentEnd(node.vertices, segment));

      return tangent ? [[getVectorHandleOriginKey(handle), tangent]] : [];
    }),
  );

  return { handleOrigins, vertexOrigins };
};
