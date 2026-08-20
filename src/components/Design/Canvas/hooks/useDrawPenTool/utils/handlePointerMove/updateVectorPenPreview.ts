import { RefObject } from 'react';

// others
import { PEN_POINT_HOVER_RESOLVERS } from './resolvePenPointHover/constants';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../types';
import { TPenPointHoverKind } from './resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

export const updateVectorPenPreview = (
  point: TPoint,
  node: TVectorNode,
  activeVertexId: string | null,
  viewport: TViewport,
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TCanvasRefs['penHoveredDragArmableVertexRef'],
): TPenPointHoverKind | null => {
  const activeVertex = activeVertexId ? node.vertices[activeVertexId] : null;

  if (activeVertex) {
    const pending = pendingOutgoingTangentRef.current;
    const tangentFromOffset = pending && pending.vertexId === activeVertexId ? pending.tangent : null;

    for (const resolve of PEN_POINT_HOVER_RESOLVERS) {
      const result = resolve({ excludeVertexId: activeVertexId, node, point, viewport });

      if (result) {
        penPreviewRef.current = { from: activeVertex, tangentFromOffset, to: result.point };
        hoveredSegmentIdRef.current = result.segmentId;
        penHoveredDragArmableVertexRef.current = result.hoverKind === 'active-vertex';

        return result.hoverKind;
      }
    }

    penPreviewRef.current = { from: activeVertex, tangentFromOffset, to: point };
    hoveredSegmentIdRef.current = null;
    penHoveredDragArmableVertexRef.current = false;

    return null;
  }

  penPreviewRef.current = null;
  hoveredSegmentIdRef.current = null;
  penHoveredDragArmableVertexRef.current = false;

  return null;
};
