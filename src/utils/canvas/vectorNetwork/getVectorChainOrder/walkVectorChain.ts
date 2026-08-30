// types
import { TVectorSegment } from 'types/design/types';

export type TVectorChainSegmentEntry = { reversed: boolean; segmentId: string };

export const walkVectorChain = (
  segments: TVectorSegment[],
  segmentsByVertex: Map<string, TVectorSegment[]>,
  startVertexId: string,
): TVectorChainSegmentEntry[] => {
  const visitedSegmentIds = new Set<string>();
  const entries: TVectorChainSegmentEntry[] = [];
  let currentVertexId = startVertexId;

  while (entries.length < segments.length) {
    const candidates = segmentsByVertex.get(currentVertexId)!;
    const nextSegment = candidates.filter((segment) => !visitedSegmentIds.has(segment.id)).sort((a, b) => a.id.localeCompare(b.id))[0];

    if (!nextSegment) {
      break;
    }

    visitedSegmentIds.add(nextSegment.id);
    const reversed = nextSegment.startId !== currentVertexId;
    entries.push({ reversed, segmentId: nextSegment.id });
    currentVertexId = reversed ? nextSegment.startId : nextSegment.endId;
  }

  return entries;
};
