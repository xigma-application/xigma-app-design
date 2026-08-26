// types
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TVectorNodeCluster } from '../getVectorNodeClusters/types';
import { TVectorPieceBoundaries } from '../getVectorPieceBoundaryKeys';
import { TVectorVertex } from 'types/design/types';
import { TVectorFace } from './types';

// utils
import { buildVectorHalfEdgeAdjacency } from '../buildVectorHalfEdgeAdjacency';
import { flattenVectorFaceSteps } from '../flattenVectorFaceSteps';
import { getPieceKeys } from './getPieceKeys';
import { getVectorFaceSignedArea } from '../getVectorFaceSignedArea';
import { isSelfBacktrack } from './isSelfBacktrack';
import { walkVectorFace } from '../walkVectorFace';

export const deriveClusterFaces = (
  cluster: TVectorNodeCluster,
  planar: TPlanarVectorNetwork,
  originVertices: Record<string, TVectorVertex>,
): TVectorFace[] => {
  const segments = cluster.segmentIds.map((id) => planar.segments[id]);
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

          /* v8 ignore if -- @preserve unreachable given current walk/planarization logic: a fresh walk
             starting from an unvisited half-edge can never produce a face key already seen this pass */
          if (!seenFaceKeys.has(key)) {
            seenFaceKeys.add(key);
            faces.push({ key, pieceKeys: getPieceKeys(steps, planar.segments, originVertices, boundaryKeysByRealSegmentId), points });
          }
        }
      }
    });
  });

  return faces;
};
