// types
import { TVectorHalfEdge } from './buildVectorHalfEdgeAdjacency';

// utils
import { getNextVectorHalfEdge } from './getNextVectorHalfEdge';

export type TVectorFaceStep = { fromId: string; segmentId: string; toId: string };

export const walkVectorFace = (
  startSegmentId: string,
  startFromId: string,
  startToId: string,
  adjacency: Map<string, TVectorHalfEdge[]>,
  visited: Set<string>,
  segmentCount: number,
): TVectorFaceStep[] | null => {
  const startKey = `${startSegmentId}:${startFromId}`;

  if (!visited.has(startKey)) {
    const steps: TVectorFaceStep[] = [];
    let fromId = startFromId;
    let toId = startToId;
    let segmentId = startSegmentId;

    for (let step = 0; step <= segmentCount * 2; step += 1) {
      const next = getNextVectorHalfEdge(adjacency, fromId, toId, segmentId);
      const nextKey = next ? `${next.segmentId}:${toId}` : null;

      visited.add(`${segmentId}:${fromId}`);
      steps.push({ fromId, segmentId, toId });

      switch (true) {
        case !next:
          return null;
        case nextKey === startKey:
          return steps;
        case visited.has(nextKey!):
          return null;
        default:
          fromId = toId;
          toId = next!.toId;
          segmentId = next!.segmentId;
      }
    }
  }

  return null;
};
