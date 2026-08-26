// types
import { TVectorNode } from 'types/design/types';

export const getVertexIdSet = (node: TVectorNode, vertexIds: string[], segmentIds: string[]): Set<string> => {
  const segmentEndpointIds = segmentIds.flatMap((id) => {
    const segment = node.segments[id];
    return segment ? [segment.startId, segment.endId] : [];
  });

  return new Set([...vertexIds, ...segmentEndpointIds]);
};
