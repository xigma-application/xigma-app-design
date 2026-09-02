// types
import { TPoint } from 'types/canvas';
import { TVectorDistanceEndpoint } from '../../../../../utils/getVectorDistanceGuides/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getFaceNearestPoint } from './getFaceNearestPoint';
import { getSegmentPolyline } from '../../../../../utils/getVectorDistanceGuides/getSegmentPolyline';
import { projectPointOntoPolyline } from '../../../../../utils/getVectorDistanceGuides/projectPointOntoPolyline';

export type THoveredFace = { faceKey: string; nodeId: string };

export const getTarget = (
  bakedNodes: TVectorNode[],
  excludeVertexIds: string[],
  hoveredVertexId: string | null,
  hoveredSegmentId: string | null,
  hoveredFace: THoveredFace | null,
  cursorPoint: TPoint,
  anchorReferencePoint: TPoint,
): TVectorDistanceEndpoint | null => {
  switch (true) {
    case Boolean(hoveredVertexId) && !excludeVertexIds.includes(hoveredVertexId as string): {
      const vertexId = hoveredVertexId as string;
      const node = bakedNodes.find((candidate) => candidate.vertices[vertexId]);

      return node ? { kind: 'point', point: node.vertices[vertexId] } : null;
    }

    case Boolean(hoveredSegmentId): {
      const segmentId = hoveredSegmentId as string;
      const node = bakedNodes.find((candidate) => candidate.segments[segmentId]);
      const segment = node?.segments[segmentId];

      return node && segment
        ? { kind: 'point', point: projectPointOntoPolyline(cursorPoint, getSegmentPolyline(node, segmentId)).foot }
        : null;
    }

    case Boolean(hoveredFace): {
      const { faceKey, nodeId } = hoveredFace as THoveredFace;
      const point = getFaceNearestPoint(bakedNodes, nodeId, faceKey, anchorReferencePoint);

      return point ? { kind: 'point', point } : null;
    }

    default:
      return null;
  }
};
