import { RefObject } from 'react';

// types
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../../types';
import { TPenPointHoverKind } from '../resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode, TViewport } from 'types/design/types';

// utils
import { clearVectorPenPreview } from './clearVectorPenPreview';
import { resolveActiveVertexPreview } from './resolveActiveVertexPreview';

export const updateVectorPenPreview = (
  point: TPoint,
  node: TVectorNode,
  nodes: Record<string, TSceneNode>,
  activeVertexId: string | null,
  viewport: TViewport,
  isShiftPressed: boolean,
  penPreviewRef: TPenRefs['penPreviewRef'],
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  hoveredSegmentIdRef: THoverRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TPenRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TVectorEditRefs['vectorAlignmentGuideRef'],
  otherOpenNodeIds: string[] = [],
): TPenPointHoverKind | null => {
  const activeVertex = activeVertexId ? node.vertices[activeVertexId] : null;

  if (activeVertex && activeVertexId) {
    return resolveActiveVertexPreview(
      point,
      node,
      nodes,
      activeVertex,
      activeVertexId,
      viewport,
      isShiftPressed,
      pendingOutgoingTangentRef,
      penPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      vectorAlignmentGuideRef,
      otherOpenNodeIds,
    );
  }

  return clearVectorPenPreview(penPreviewRef, hoveredSegmentIdRef, penHoveredDragArmableVertexRef, vectorAlignmentGuideRef);
};
