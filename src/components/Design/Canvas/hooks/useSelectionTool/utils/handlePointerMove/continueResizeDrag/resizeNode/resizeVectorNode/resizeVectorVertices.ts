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
  round: boolean,
): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(vertices).map(([vertexId, vertex]) => {
      const x = transformCoord(vertex.x, anchors.x, scaleX);
      const y = transformCoord(vertex.y, anchors.y, scaleY);

      return [vertexId, { id: vertexId, x: round ? Math.round(x) : x, y: round ? Math.round(y) : y }];
    }),
  );
