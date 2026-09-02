// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

export const getSelectedVerticesRect = (bakedNodes: TVectorNode[], vertexIds: string[]): TDraftRect | null => {
  const points: TPoint[] = [];

  bakedNodes.forEach((node) => {
    vertexIds.forEach((vertexId) => {
      const vertex = node.vertices[vertexId];

      if (vertex) {
        points.push(vertex);
      }
    });
  });

  if (points.length !== 0) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
  }

  return null;
};
