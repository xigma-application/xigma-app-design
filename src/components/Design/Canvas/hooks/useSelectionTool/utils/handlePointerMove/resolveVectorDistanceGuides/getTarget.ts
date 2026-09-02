// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getSegmentPolyline } from '../../../../../utils/getVectorDistanceGuides/getSegmentPolyline';
import { projectPointOntoPolyline } from '../../../../../utils/getVectorDistanceGuides/projectPointOntoPolyline';

export const getTarget = (
  bakedNodes: TVectorNode[],
  excludeVertexIds: string[],
  hoveredVertexId: string | null,
  hoveredSegmentId: string | null,
  cursorPoint: TPoint,
): TPoint | null => {
  if (hoveredVertexId && !excludeVertexIds.includes(hoveredVertexId)) {
    const node = bakedNodes.find((candidate) => candidate.vertices[hoveredVertexId]);

    return node ? node.vertices[hoveredVertexId] : null;
  }

  if (hoveredSegmentId) {
    const node = bakedNodes.find((candidate) => candidate.segments[hoveredSegmentId]);
    const segment = node?.segments[hoveredSegmentId];

    if (node && segment) {
      return projectPointOntoPolyline(cursorPoint, getSegmentPolyline(node, hoveredSegmentId)).foot;
    }
  }

  return null;
};
