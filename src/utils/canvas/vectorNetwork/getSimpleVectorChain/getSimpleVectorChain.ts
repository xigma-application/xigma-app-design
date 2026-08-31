// types
import { TVectorNode } from 'types/design/types';
import { TSimpleVectorChain } from './types';

// utils
import { flattenVectorSegments } from '../flattenVectorSegments';
import { getAdjacency } from './getAdjacency';
import { getVertexDegrees } from './getVertexDegrees';
import { walkChain } from './walkChain';

export const getSimpleVectorChain = (node: TVectorNode): TSimpleVectorChain | null => {
  const segments = flattenVectorSegments(node);

  if (segments.length !== 0) {
    const degrees = getVertexDegrees(segments);
    const adjacency = getAdjacency(segments);

    if (![...degrees.values()].some((degree) => degree > 2)) {
      const endpointVertexIds = [...degrees.entries()].filter(([, degree]) => degree === 1).map(([vertexId]) => vertexId);

      if (endpointVertexIds.length === 2) {
        const points = walkChain(endpointVertexIds[0], adjacency, segments.length);
        return points ? { closed: false, points } : null;
      }

      if (endpointVertexIds.length === 0) {
        const [firstVertexId] = degrees.keys();
        const points = walkChain(firstVertexId, adjacency, segments.length);

        return points && points.length > 1 ? { closed: true, points: points.slice(0, -1) } : null;
      }
    }
  }

  return null;
};

export type { TSimpleVectorChain } from './types';
