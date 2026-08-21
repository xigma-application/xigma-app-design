import { RefObject } from 'react';

// others
import { PEN_POINT_HOVER_RESOLVERS } from './resolvePenPointHover/constants';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../types';
import { TPenPointHoverKind } from './resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode, TViewport } from 'types/design/types';

// utils
import { applyAngleSnapToPenPreview } from './applyAngleSnapToPenPreview';

export const updateVectorPenPreview = (
  point: TPoint,
  node: TVectorNode,
  nodes: Record<string, TSceneNode>,
  activeVertexId: string | null,
  viewport: TViewport,
  isShiftPressed: boolean,
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TCanvasRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
): TPenPointHoverKind | null => {
  const activeVertex = activeVertexId ? node.vertices[activeVertexId] : null;

  if (activeVertex) {
    const pending = pendingOutgoingTangentRef.current;
    const tangentFromOffset = pending && pending.vertexId === activeVertexId ? pending.tangent : null;

    for (const resolve of PEN_POINT_HOVER_RESOLVERS) {
      const result = resolve({ excludeVertexId: activeVertexId, node, point, viewport });

      if (result) {
        penPreviewRef.current = { from: activeVertex, isSnapped: false, tangentFromOffset, to: result.point };
        hoveredSegmentIdRef.current = result.segmentId;
        penHoveredDragArmableVertexRef.current = result.hoverKind === 'active-vertex' || result.hoverKind === 'vertex';
        vectorAlignmentGuideRef.current = null;

        return result.hoverKind;
      }
    }

    return applyAngleSnapToPenPreview(
      point,
      activeVertex,
      tangentFromOffset,
      viewport.zoom,
      isShiftPressed,
      nodes,
      penPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      vectorAlignmentGuideRef,
    );
  }

  penPreviewRef.current = null;
  hoveredSegmentIdRef.current = null;
  penHoveredDragArmableVertexRef.current = false;
  vectorAlignmentGuideRef.current = null;

  return null;
};
