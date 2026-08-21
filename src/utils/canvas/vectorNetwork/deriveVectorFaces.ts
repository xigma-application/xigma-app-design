// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from './buildVectorHalfEdgeAdjacency';
import { flattenSegment } from './flattenSegment';
import { getVectorCurveSegmentCount } from './getVectorCurveSegmentCount';
import { TVectorFaceStep, walkVectorFace } from './walkVectorFace';

export type TVectorFace = {
  key: string;
  points: TPoint[];
};

const cache = new WeakMap<TVectorNode, TVectorFace[]>();

const getFaceBoundary = (steps: TVectorFaceStep[], node: TVectorNode): TPoint[] =>
  steps.flatMap(({ fromId, segmentId, toId }) => {
    const segment = node.segments[segmentId];
    const forward = segment.startId === fromId;
    const tangentAtFrom = forward ? segment.tangentStart : segment.tangentEnd;
    const tangentAtTo = forward ? segment.tangentEnd : segment.tangentStart;
    const from = node.vertices[fromId];
    const to = node.vertices[toId];
    const points = flattenSegment(from, to, tangentAtFrom, tangentAtTo, getVectorCurveSegmentCount(from, to, tangentAtFrom, tangentAtTo));

    return points.slice(0, -1);
  });

export const deriveVectorFaces = (node: TVectorNode): TVectorFace[] => {
  const cached = cache.get(node);

  if (cached) {
    return cached;
  }

  const segments = Object.values(node.segments);
  const adjacency = buildVectorHalfEdgeAdjacency(segments);
  const visited = new Set<string>();
  const seenFaceKeys = new Set<string>();
  const faces: TVectorFace[] = [];

  segments.forEach((segment) => {
    [
      { fromId: segment.startId, toId: segment.endId },
      { fromId: segment.endId, toId: segment.startId },
    ].forEach((direction) => {
      const steps = walkVectorFace(segment.id, direction.fromId, direction.toId, adjacency, visited, segments.length);

      if (steps) {
        const key = steps
          .map((step) => step.segmentId)
          .sort()
          .join(',');

        if (!seenFaceKeys.has(key)) {
          seenFaceKeys.add(key);
          faces.push({ key, points: getFaceBoundary(steps, node) });
        }
      }
    });
  });

  cache.set(node, faces);

  return faces;
};
