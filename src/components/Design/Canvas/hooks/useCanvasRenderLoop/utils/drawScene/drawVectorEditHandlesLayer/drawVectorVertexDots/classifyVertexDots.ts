// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVertexDotBuckets } from './types';

export const classifyVertexDots = (
  node: TVectorNode,
  selectedVertexIds: ReadonlySet<string>,
  newVertexIds: ReadonlySet<string>,
  hoveredVertexId: string | null,
): TVertexDotBuckets => {
  const plainVertexCenters: TPoint[] = [];
  const selectedVertexCenters: TPoint[] = [];

  Object.values(node.vertices).forEach((vertex) => {
    if (newVertexIds.has(vertex.id)) {
      return;
    }

    if (selectedVertexIds.has(vertex.id)) {
      selectedVertexCenters.push(vertex);

      return;
    }

    if (vertex.id === hoveredVertexId) {
      return;
    }

    plainVertexCenters.push(vertex);
  });

  return { plainVertexCenters, selectedVertexCenters };
};
