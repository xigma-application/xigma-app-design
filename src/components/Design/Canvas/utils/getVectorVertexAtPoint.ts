// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

export const getVectorVertexAtPoint = (
  point: TPoint,
  node: TVectorNode,
  tolerance: number,
  excludeId?: string | null,
): { vertexId: string } | null => {
  const candidates = Object.values(node.vertices)
    .filter((vertex) => vertex.id !== excludeId)
    .map((vertex) => ({ distance: Math.hypot(point.x - vertex.x, point.y - vertex.y), vertexId: vertex.id }))
    .filter((candidate) => candidate.distance <= tolerance)
    .sort((a, b) => a.distance - b.distance);

  return candidates.length > 0 ? { vertexId: candidates[0].vertexId } : null;
};
