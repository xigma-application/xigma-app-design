// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getPointsBounds } from '../../../../../utils/getVectorDistanceGuides/getPointsBounds';

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

  return getPointsBounds(points);
};
