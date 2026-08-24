import { nanoid } from '@reduxjs/toolkit';

// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex, TVertexHandleMode } from 'types/design/types';

// utils
import { getCatmullRomTangents } from './getCatmullRomTangents';

export type TPencilVectorNetwork = {
  segments: Record<string, TVectorSegment>;
  vertexHandleModes: Record<string, TVertexHandleMode>;
  vertices: Record<string, TVectorVertex>;
};

export const buildVectorNetworkFromPoints = (points: TPoint[], tension: number): TPencilVectorNetwork => {
  const tangents = getCatmullRomTangents(points, tension);
  const vertexIds = points.map(() => nanoid());
  const vertices: Record<string, TVectorVertex> = {};
  const vertexHandleModes: Record<string, TVertexHandleMode> = {};
  const segments: Record<string, TVectorSegment> = {};

  points.forEach((point, index) => {
    const vertexId = vertexIds[index];

    vertices[vertexId] = { id: vertexId, x: point.x, y: point.y };
    vertexHandleModes[vertexId] = 'symmetric';

    if (index > 0) {
      const segmentId = nanoid();
      const tangent = tangents[index];

      segments[segmentId] = {
        endId: vertexId,
        id: segmentId,
        startId: vertexIds[index - 1],
        tangentEnd: { x: -tangent.x, y: -tangent.y },
        tangentStart: tangents[index - 1],
      };
    }
  });

  return { segments, vertexHandleModes, vertices };
};
