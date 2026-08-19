// types
import { TVectorHalfEdge } from './buildVectorHalfEdgeAdjacency';

export type TVectorFaceStep = { fromId: string; segmentId: string; toId: string };

export const walkVectorFace = (
  startSegmentId: string,
  startFromId: string,
  startToId: string,
  adjacency: Map<string, TVectorHalfEdge[]>,
  visited: Set<string>,
  segmentCount: number,
): TVectorFaceStep[] | null => {
  const steps: TVectorFaceStep[] = [];
  let fromId = startFromId;
  let toId = startToId;
  let segmentId = startSegmentId;

  for (let step = 0; step <= segmentCount; step += 1) {
    const key = `${segmentId}:${fromId}`;

    if (visited.has(key)) {
      return null;
    }

    visited.add(key);
    steps.push({ fromId, segmentId, toId });

    if (toId === startFromId) {
      return steps;
    }

    const incident = (adjacency.get(toId) ?? []).filter((edge) => !(edge.segmentId === segmentId && edge.toId === fromId));

    if (incident.length !== 1) {
      return null;
    }

    fromId = toId;
    toId = incident[0].toId;
    segmentId = incident[0].segmentId;
  }

  return null;
};
