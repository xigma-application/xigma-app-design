// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from './buildVectorHalfEdgeAdjacency';
import { flattenSegment } from './flattenSegment';
import { getVectorCurveSegmentCount } from './getVectorCurveSegmentCount';
import { getVectorFaceSignedArea } from './getVectorFaceSignedArea';
import { planarizeVectorNetwork } from './planarizeVectorNetwork/planarizeVectorNetwork';
import { TVectorFaceStep, walkVectorFace } from './walkVectorFace';

export type TVectorFace = {
  key: string;
  points: TPoint[];
};

const cache = new WeakMap<TVectorNode, TVectorFace[]>();

const getFaceBoundary = (
  steps: TVectorFaceStep[],
  segments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
): TPoint[] =>
  steps.flatMap(({ fromId, segmentId, toId }) => {
    const segment = segments[segmentId];
    const forward = segment.startId === fromId;
    const tangentAtFrom = forward ? segment.tangentStart : segment.tangentEnd;
    const tangentAtTo = forward ? segment.tangentEnd : segment.tangentStart;
    const from = vertices[fromId];
    const to = vertices[toId];
    const points = flattenSegment(from, to, tangentAtFrom, tangentAtTo, getVectorCurveSegmentCount(from, to, tangentAtFrom, tangentAtTo));

    return points.slice(0, -1);
  });

const isSelfBacktrack = (steps: TVectorFaceStep[]): boolean => steps.length === 2 && steps[0].segmentId === steps[1].segmentId;

export const deriveVectorFaces = (node: TVectorNode): TVectorFace[] => {
  const cached = cache.get(node);

  if (!cached) {
    const planar = planarizeVectorNetwork(Object.values(node.segments), node.vertices);
    const segments = Object.values(planar.segments);
    const adjacency = buildVectorHalfEdgeAdjacency(segments, planar.vertices);
    const visited = new Set<string>();
    const seenFaceKeys = new Set<string>();
    const faces: TVectorFace[] = [];

    segments.forEach((segment) => {
      [
        { fromId: segment.startId, toId: segment.endId },
        { fromId: segment.endId, toId: segment.startId },
      ].forEach((direction) => {
        const steps = walkVectorFace(segment.id, direction.fromId, direction.toId, adjacency, visited, segments.length);

        if (steps && !isSelfBacktrack(steps)) {
          const points = getFaceBoundary(steps, planar.segments, planar.vertices);

          if (getVectorFaceSignedArea(points) >= 0) {
            const key = steps
              .map((step) => step.segmentId)
              .sort()
              .join(',');

            /* v8 ignore if -- @preserve unreachable given current walk/planarization logic, see comment above */
            if (!seenFaceKeys.has(key)) {
              seenFaceKeys.add(key);
              faces.push({ key, points });
            }
          }
        }
      });
    });

    cache.set(node, faces);
    return faces;
  }

  return cached;
};
