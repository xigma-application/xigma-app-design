// others
import { BOOLEAN_JUNCTION_EPSILON } from './constants';

// types
import { TVectorVertex } from 'types/design/types';

export const getCanonicalVertexIds = (vertices: Record<string, TVectorVertex>): Map<string, string> => {
  const canonicalIds = new Map<string, string>();
  const representatives: TVectorVertex[] = [];

  Object.values(vertices).forEach((vertex) => {
    const match = representatives.find(
      (representative) =>
        Math.abs(representative.x - vertex.x) < BOOLEAN_JUNCTION_EPSILON &&
        Math.abs(representative.y - vertex.y) < BOOLEAN_JUNCTION_EPSILON,
    );

    if (match) {
      canonicalIds.set(vertex.id, match.id);
    } else {
      representatives.push(vertex);
      canonicalIds.set(vertex.id, vertex.id);
    }
  });

  return canonicalIds;
};
