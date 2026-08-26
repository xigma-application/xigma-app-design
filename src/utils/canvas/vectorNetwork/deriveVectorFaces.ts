// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';
import { getVectorPieceBoundaryKeys, TVectorPieceBoundaries } from './getVectorPieceBoundaryKeys';

// utils
import { buildVectorHalfEdgeAdjacency } from './buildVectorHalfEdgeAdjacency';
import { flattenVectorFaceSteps } from './flattenVectorFaceSteps';
import { getPlanarVectorNetwork } from './getPlanarVectorNetwork';
import { getVectorFaceSignedArea } from './getVectorFaceSignedArea';
import { getVectorFillPieceKey } from './getVectorFillPieceKey';
import { TVectorFaceStep, walkVectorFace } from './walkVectorFace';

export type TVectorFace = {
  key: string;
  pieceKeys: string[];
  points: TPoint[];
};

const getPieceKeys = (
  steps: TVectorFaceStep[],
  planarSegments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
  boundaryKeysByRealSegmentId: Map<string, Record<string, TVectorPieceBoundaries>>,
): string[] => [
  ...new Set(
    steps.map((step) => {
      const realSegmentId = step.segmentId.split('#')[0];
      const boundaryKeys =
        boundaryKeysByRealSegmentId.get(realSegmentId) ?? getVectorPieceBoundaryKeys(realSegmentId, planarSegments, vertices);

      boundaryKeysByRealSegmentId.set(realSegmentId, boundaryKeys);

      return getVectorFillPieceKey(realSegmentId, boundaryKeys[step.segmentId]);
    }),
  ),
];

const cache = new WeakMap<TVectorNode, TVectorFace[]>();

const isSelfBacktrack = (steps: TVectorFaceStep[]): boolean => steps.length === 2 && steps[0].segmentId === steps[1].segmentId;

export const deriveVectorFaces = (node: TVectorNode): TVectorFace[] => {
  const cached = cache.get(node);

  if (!cached) {
    const planar = getPlanarVectorNetwork(node);
    const segments = Object.values(planar.segments);
    const adjacency = buildVectorHalfEdgeAdjacency(segments, planar.vertices);
    const visited = new Set<string>();
    const seenFaceKeys = new Set<string>();
    const boundaryKeysByRealSegmentId = new Map<string, Record<string, TVectorPieceBoundaries>>();
    const faces: TVectorFace[] = [];

    segments.forEach((segment) => {
      [
        { fromId: segment.startId, toId: segment.endId },
        { fromId: segment.endId, toId: segment.startId },
      ].forEach((direction) => {
        const steps = walkVectorFace(segment.id, direction.fromId, direction.toId, adjacency, visited, segments.length);

        if (steps && !isSelfBacktrack(steps)) {
          const points = flattenVectorFaceSteps(steps, planar.segments, planar.vertices);

          if (getVectorFaceSignedArea(points) >= 0) {
            const key = steps
              .map((step) => step.segmentId)
              .sort()
              .join(',');

            /* v8 ignore if -- @preserve unreachable given current walk/planarization logic, see comment above */
            if (!seenFaceKeys.has(key)) {
              seenFaceKeys.add(key);
              faces.push({ key, pieceKeys: getPieceKeys(steps, planar.segments, node.vertices, boundaryKeysByRealSegmentId), points });
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
