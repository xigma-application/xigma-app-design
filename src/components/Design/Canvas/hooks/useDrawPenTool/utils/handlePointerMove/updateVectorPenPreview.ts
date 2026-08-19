import { RefObject } from 'react';

// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { getVectorVertexAtPoint } from '../../../../utils/getVectorVertexAtPoint';

export const updateVectorPenPreview = (
  point: TPoint,
  node: TVectorNode,
  activeVertexId: string | null,
  viewport: TViewport,
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  penHoverVertexRef: TCanvasRefs['penHoverVertexRef'],
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  const hover = getVectorVertexAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom, activeVertexId);
  const hoverVertex = hover ? node.vertices[hover.vertexId] : null;
  penHoverVertexRef.current = hover && hoverVertex ? { nodeId: node.id, point: hoverVertex, vertexId: hover.vertexId } : null;
  const activeVertex = activeVertexId ? node.vertices[activeVertexId] : null;
  const pending = pendingOutgoingTangentRef.current;

  penPreviewRef.current = activeVertex
    ? {
        from: activeVertex,
        tangentFromOffset: pending && pending.vertexId === activeVertexId ? pending.tangent : null,
        to: hoverVertex ?? point,
      }
    : null;
};
