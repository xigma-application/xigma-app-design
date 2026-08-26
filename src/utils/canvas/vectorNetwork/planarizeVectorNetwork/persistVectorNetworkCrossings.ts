// others
import { nanoid } from '@reduxjs/toolkit';

// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { planarizeVectorNetwork } from './planarizeVectorNetwork';

export const persistVectorNetworkCrossings = (
  segments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
): { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => {
  const planar = planarizeVectorNetwork(segments, vertices);
  const newVertexIds = Object.keys(planar.vertices).filter((id) => !(id in vertices));

  if (newVertexIds.length === 0) {
    return { segments, vertices };
  }

  const realIdByVirtualId = new Map(newVertexIds.map((virtualId) => [virtualId, nanoid()]));
  const resolveId = (id: string): string => realIdByVirtualId.get(id) ?? id;

  const persistedVertices = { ...vertices };

  newVertexIds.forEach((virtualId) => {
    const realId = resolveId(virtualId);

    persistedVertices[realId] = { ...planar.vertices[virtualId], id: realId };
  });

  const persistedSegments = Object.fromEntries(
    Object.entries(planar.segments).map(([segmentId, segment]) => [
      segmentId,
      { ...segment, endId: resolveId(segment.endId), startId: resolveId(segment.startId) },
    ]),
  );

  return { segments: persistedSegments, vertices: persistedVertices };
};
