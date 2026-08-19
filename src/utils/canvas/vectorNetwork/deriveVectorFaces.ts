// others
import { VECTOR_CURVE_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from './buildVectorHalfEdgeAdjacency';
import { flattenSegment } from './flattenSegment';
import { TVectorFaceStep, walkVectorFace } from './walkVectorFace';

const cache = new WeakMap<TVectorNode, TPoint[][]>();

const getFaceBoundary = (steps: TVectorFaceStep[], node: TVectorNode): TPoint[] =>
  steps.flatMap(({ fromId, segmentId, toId }) => {
    const segment = node.segments[segmentId];
    const forward = segment.startId === fromId;
    const tangentAtFrom = forward ? segment.tangentStart : segment.tangentEnd;
    const tangentAtTo = forward ? segment.tangentEnd : segment.tangentStart;
    const points = flattenSegment(node.vertices[fromId], node.vertices[toId], tangentAtFrom, tangentAtTo, VECTOR_CURVE_SEGMENTS);

    return points.slice(0, -1);
  });

export const deriveVectorFaces = (node: TVectorNode): TPoint[][] => {
  const cached = cache.get(node);

  if (cached) {
    return cached;
  }

  const segments = Object.values(node.segments);
  const adjacency = buildVectorHalfEdgeAdjacency(segments);
  const visited = new Set<string>();
  const seenFaceKeys = new Set<string>();
  const faces: TPoint[][] = [];

  segments.forEach((segment) => {
    [
      { fromId: segment.startId, toId: segment.endId },
      { fromId: segment.endId, toId: segment.startId },
    ].forEach((direction) => {
      const steps = walkVectorFace(segment.id, direction.fromId, direction.toId, adjacency, visited, segments.length);

      if (steps) {
        const faceKey = steps
          .map((step) => step.segmentId)
          .sort()
          .join(',');

        if (!seenFaceKeys.has(faceKey)) {
          seenFaceKeys.add(faceKey);
          faces.push(getFaceBoundary(steps, node));
        }
      }
    });
  });

  cache.set(node, faces);

  return faces;
};
