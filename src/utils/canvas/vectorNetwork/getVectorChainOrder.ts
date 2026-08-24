// types
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorVertexDegrees } from './getVectorVertexDegrees';

export type TVectorChainSegmentEntry = { reversed: boolean; segmentId: string };

export type TVectorChainOrder = { entries: TVectorChainSegmentEntry[]; isClosed: boolean };

const buildSegmentsByVertex = (segments: TVectorSegment[]): Map<string, TVectorSegment[]> => {
  const segmentsByVertex = new Map<string, TVectorSegment[]>();

  segments.forEach((segment) => {
    [segment.startId, segment.endId].forEach((vertexId) => {
      segmentsByVertex.set(vertexId, [...(segmentsByVertex.get(vertexId) ?? []), segment]);
    });
  });

  return segmentsByVertex;
};

const walkVectorChain = (
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

export const getVectorChainOrder = (node: TVectorNode): TVectorChainOrder | null => {
  const segments = Object.values(node.segments);

  if (segments.length === 0) {
    return null;
  }

  const degreeByVertexId = getVectorVertexDegrees(node.segments);

  if ([...degreeByVertexId.values()].some((degree) => degree > 2)) {
    return null;
  }

  const openEndpointIds = [...degreeByVertexId.entries()]
    .filter(([, degree]) => degree === 1)
    .map(([vertexId]) => vertexId)
    .sort();

  const isClosed = openEndpointIds.length === 0;

  if (!isClosed && openEndpointIds.length !== 2) {
    return null;
  }

  const startVertexId = isClosed ? [...degreeByVertexId.keys()].sort()[0] : openEndpointIds[0];
  const segmentsByVertex = buildSegmentsByVertex(segments);
  const entries = walkVectorChain(segments, segmentsByVertex, startVertexId);

  if (entries.length !== segments.length) {
    return null;
  }

  return { entries, isClosed };
};
