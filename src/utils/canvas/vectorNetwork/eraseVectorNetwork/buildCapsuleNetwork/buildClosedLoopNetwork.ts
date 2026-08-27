// others
import { nanoid } from '@reduxjs/toolkit';

// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export const buildClosedLoopNetwork = (
  polygon: TPoint[],
): { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => {
  const vertexIds = polygon.map(() => nanoid());
  const vertices = Object.fromEntries(vertexIds.map((id, index) => [id, { id, x: polygon[index].x, y: polygon[index].y }]));
  const segments = Object.fromEntries(
    vertexIds.map((startId, index) => {
      const id = nanoid();
      return [id, { endId: vertexIds[(index + 1) % vertexIds.length], id, startId, tangentEnd: null, tangentStart: null }];
    }),
  );

  return { segments, vertices };
};
