// types
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TPenPointHoverKind } from '../resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorTangent, TVectorVertex, TViewport } from 'types/design/types';

// utils
import { findHoverInNode } from './findHoverInNode';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const resolveCrossNodeHoverPreview = (
  point: TPoint,
  otherOpenNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  activeVertex: TVectorVertex,
  tangentFromOffset: TVectorTangent,
  viewport: TViewport,
  penPreviewRef: TPenRefs['penPreviewRef'],
  hoveredSegmentIdRef: THoverRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TPenRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TVectorEditRefs['vectorAlignmentGuideRef'],
): TPenPointHoverKind | null => {
  for (const nodeId of otherOpenNodeIds) {
    const otherNode = getVectorEditingNode(nodes, nodeId);

    if (otherNode) {
      const result = findHoverInNode(otherNode, point, viewport);

      if (result) {
        penPreviewRef.current = { from: activeVertex, isSnapped: false, tangentFromOffset, to: result.point };
        hoveredSegmentIdRef.current = result.segmentId;
        penHoveredDragArmableVertexRef.current = false;
        vectorAlignmentGuideRef.current = null;

        return result.hoverKind;
      }
    }
  }

  return null;
};
