// types
import { TVectorNode } from 'types/design/types';

// utils
import { buildSegmentsByVertex } from './buildSegmentsByVertex';
import { getVectorVertexDegrees } from '../getVectorVertexDegrees';
import { walkVectorChain, TVectorChainSegmentEntry } from './walkVectorChain';

export type TVectorChainOrder = { entries: TVectorChainSegmentEntry[]; isClosed: boolean };

export const getVectorChainOrder = (node: TVectorNode): TVectorChainOrder | null => {
  const segments = Object.values(node.segments);

  if (segments.length !== 0) {
    const degreeByVertexId = getVectorVertexDegrees(node.segments);

    if ([...degreeByVertexId.values()].every((degree) => degree <= 2)) {
      const vertexIds = Object.keys(node.vertices);
      const byDrawOrder = (a: string, b: string): number => vertexIds.indexOf(a) - vertexIds.indexOf(b);
      const openEndpointIds = [...degreeByVertexId.entries()]
        .filter(([, degree]) => degree === 1)
        .map(([vertexId]) => vertexId)
        .sort(byDrawOrder);
      const isClosed = openEndpointIds.length === 0;

      if (isClosed || openEndpointIds.length === 2) {
        const startVertexId = isClosed ? [...degreeByVertexId.keys()].sort(byDrawOrder)[0] : openEndpointIds[0];
        const entries = walkVectorChain(segments, buildSegmentsByVertex(segments), startVertexId);

        if (entries.length === segments.length) {
          return { entries, isClosed };
        }
      }
    }
  }

  return null;
};
