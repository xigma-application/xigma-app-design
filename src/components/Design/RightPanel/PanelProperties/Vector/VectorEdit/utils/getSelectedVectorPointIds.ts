// store
import { TVectorPointSelection } from 'store/design/types';

// types
import { TVectorNode } from 'types/design/types';

export const getSelectedVectorPointIds = (node: TVectorNode, selection: TVectorPointSelection): string[] => {
  const segmentEndIds = selection.segmentIds
    .map((segmentId) => node.segments[segmentId])
    .filter(Boolean)
    .flatMap((segment) => [segment.startId, segment.endId]);

  return [...new Set([...selection.vertexIds, ...segmentEndIds])].filter((vertexId) => node.vertices[vertexId]);
};
