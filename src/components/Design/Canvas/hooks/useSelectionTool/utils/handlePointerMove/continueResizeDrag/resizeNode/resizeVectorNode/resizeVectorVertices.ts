// types
import { TPoint } from 'types/canvas';
import { TVectorVertex } from 'types/design/types';

// utils
import { transformCoord } from '../../transformCoord';

export const resizeVectorVertices = (
  vertices: Record<string, TPoint>,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(vertices).map(([vertexId, vertex]) => [
      vertexId,
      { id: vertexId, x: transformCoord(vertex.x, anchors.x, scaleX), y: transformCoord(vertex.y, anchors.y, scaleY) },
    ]),
  );
