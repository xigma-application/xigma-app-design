// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

export const getVectorCornerHandleAtPoint = (point: TPoint, node: TVectorNode, tolerance: number): { vertexId: string } | null => {
  const candidates = Object.values(node.vertices)
    .map((vertex) => ({ distance: Math.hypot(point.x - vertex.x, point.y - vertex.y), vertexId: vertex.id }))
    .filter((candidate) => candidate.distance <= tolerance)
    .sort((a, b) => a.distance - b.distance);

  return candidates[0] ? { vertexId: candidates[0].vertexId } : null;
};
