// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export const getRemainingVertices = (
  vertices: Record<string, TVectorVertex>,
  segments: Record<string, TVectorSegment>,
): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(vertices).filter(([id]) => Object.values(segments).some((segment) => segment.startId === id || segment.endId === id)),
  );
