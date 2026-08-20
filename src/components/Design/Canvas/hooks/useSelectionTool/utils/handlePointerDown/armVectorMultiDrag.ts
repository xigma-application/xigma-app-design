import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';

const getVectorHandleOriginKey = (handle: TVectorHandleHover): string => `${handle.end}:${handle.segmentId}`;

export const armVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorMultiDragRef: RefObject<TVectorMultiDragState | null>,
  node: TVectorNode,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  point: TPoint,
): void => {
  const vertexOrigins = Object.fromEntries(
    selectedVertexIds.map((vertexId) => [vertexId, { x: node.vertices[vertexId].x, y: node.vertices[vertexId].y }]),
  );
  const handleOrigins = Object.fromEntries(
    selectedHandles.flatMap((handle) => {
      const segment = node.segments[handle.segmentId];
      const tangent = handle.end === 'start' ? getEffectiveTangentStart(node.vertices, segment) : segment.tangentEnd;

      return tangent ? [[getVectorHandleOriginKey(handle), tangent]] : [];
    }),
  );

  vectorMultiDragRef.current = { handleOrigins, nodeId: node.id, pointerStart: point, vertexOrigins };
  canvas.setPointerCapture(event.pointerId);
};
