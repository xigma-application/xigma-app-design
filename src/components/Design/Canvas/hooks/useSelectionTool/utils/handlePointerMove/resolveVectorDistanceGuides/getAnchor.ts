// types
import { TVectorDistanceAnchorResult } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { getSegmentMidpoint } from 'utils/canvas/vectorNetwork/getSegmentMidpoint';

export const getAnchor = (
  bakedNodes: TVectorNode[],
  selectedVertexIds: string[],
  selectedSegmentIds: string[],
): TVectorDistanceAnchorResult | null => {
  if (selectedVertexIds.length === 1) {
    const node = bakedNodes.find((candidate) => candidate.vertices[selectedVertexIds[0]]);
    return node ? { anchorVertexId: selectedVertexIds[0], point: node.vertices[selectedVertexIds[0]] } : null;
  }

  if (selectedSegmentIds.length === 1) {
    const node = bakedNodes.find((candidate) => candidate.segments[selectedSegmentIds[0]]);

    if (node) {
      const segment = node.segments[selectedSegmentIds[0]];

      return {
        anchorVertexId: null,
        point: getSegmentMidpoint(node.vertices[segment.startId], node.vertices[segment.endId], segment.tangentStart, segment.tangentEnd),
      };
    }
  }

  return null;
};
