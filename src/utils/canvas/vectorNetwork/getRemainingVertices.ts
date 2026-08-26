// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export const getRemainingVertices = (
  vertices: Record<string, TVectorVertex>,
  segments: Record<string, TVectorSegment>,
): Record<string, TVectorVertex> => {
  const referencedVertexIds = new Set<string>();

  Object.values(segments).forEach((segment) => {
    referencedVertexIds.add(segment.startId);
    referencedVertexIds.add(segment.endId);
  });

  return Object.fromEntries(Object.entries(vertices).filter(([id]) => referencedVertexIds.has(id)));
};
