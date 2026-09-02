// types
import { TVectorDistanceTarget } from '../../../../../utils/getVectorDistanceGuides/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getSegmentPolyline } from '../../../../../utils/getVectorDistanceGuides/getSegmentPolyline';

export const getTarget = (
  bakedNodes: TVectorNode[],
  anchorVertexId: string | null,
  hoveredVertexId: string | null,
  hoveredSegmentId: string | null,
): TVectorDistanceTarget | null => {
  if (hoveredVertexId && hoveredVertexId !== anchorVertexId) {
    const node = bakedNodes.find((candidate) => candidate.vertices[hoveredVertexId]);
    return node ? { kind: 'vertex', point: node.vertices[hoveredVertexId] } : null;
  }

  if (hoveredSegmentId) {
    const node = bakedNodes.find((candidate) => candidate.segments[hoveredSegmentId]);
    const segment = node?.segments[hoveredSegmentId];

    if (node && segment && segment.startId !== anchorVertexId && segment.endId !== anchorVertexId) {
      return { kind: 'segment', polyline: getSegmentPolyline(node, hoveredSegmentId) };
    }
  }

  return null;
};
