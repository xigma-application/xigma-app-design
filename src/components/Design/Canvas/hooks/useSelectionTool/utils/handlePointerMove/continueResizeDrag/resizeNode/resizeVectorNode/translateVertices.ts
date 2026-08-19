// types
import { TPoint } from 'types/canvas';
import { TVectorVertex } from 'types/design/types';

export const translateVertices = (vertices: Record<string, TVectorVertex>, delta: TPoint): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(vertices).map(([vertexId, vertex]) => [vertexId, { id: vertexId, x: vertex.x + delta.x, y: vertex.y + delta.y }]),
  );
