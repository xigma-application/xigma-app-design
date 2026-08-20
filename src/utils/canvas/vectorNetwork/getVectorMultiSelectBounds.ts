// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode, TVectorVertex } from 'types/design/types';

// utils
import { getEffectiveTangentEnd } from './getEffectiveTangentEnd';
import { getEffectiveTangentStart } from './getEffectiveTangentStart';
import { getVectorHandlePosition } from './getVectorHandlePosition';

const getSelectedHandlePoints = (node: TVectorNode, selectedHandles: TVectorHandleHover[]): TPoint[] =>
  selectedHandles
    .map((handle) => {
      const segment = node.segments[handle.segmentId];

      if (segment) {
        const vertex = handle.end === 'start' ? node.vertices[segment.startId] : node.vertices[segment.endId];
        const tangent =
          handle.end === 'start' ? getEffectiveTangentStart(node.vertices, segment) : getEffectiveTangentEnd(node.vertices, segment);

        return getVectorHandlePosition(vertex, tangent);
      }

      return null;
    })
    .filter((point): point is TPoint => point !== null);

export const getVectorMultiSelectBounds = (
  node: TVectorNode,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
): TDraftRect | null => {
  const vertexPoints = selectedVertexIds.map((id) => node.vertices[id]).filter((vertex): vertex is TVectorVertex => Boolean(vertex));
  const points = [...vertexPoints, ...getSelectedHandlePoints(node, selectedHandles)];

  if (points.length !== 0) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    return { height: Math.max(...ys) - minY, width: Math.max(...xs) - minX, x: minX, y: minY };
  }

  return null;
};
