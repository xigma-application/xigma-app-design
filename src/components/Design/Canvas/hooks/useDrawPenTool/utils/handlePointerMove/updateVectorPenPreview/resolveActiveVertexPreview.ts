import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../../types';
import { TPenPointHoverKind } from '../resolvePenPointHover/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode, TVectorTangent, TVectorVertex, TViewport } from 'types/design/types';

// utils
import { applyAngleSnapToPenPreview } from './applyAngleSnapToPenPreview';
import { resolveCrossNodeHoverPreview } from './resolveCrossNodeHoverPreview';
import { resolveSameNodeHoverPreview } from './resolveSameNodeHoverPreview';

const getTangentFromOffset = (pending: TPendingOutgoingTangent | null, activeVertexId: string): TVectorTangent =>
  pending && pending.vertexId === activeVertexId ? pending.tangent : null;

export const resolveActiveVertexPreview = (
  point: TPoint,
  node: TVectorNode,
  nodes: Record<string, TSceneNode>,
  activeVertex: TVectorVertex,
  activeVertexId: string,
  viewport: TViewport,
  isShiftPressed: boolean,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TCanvasRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
  otherOpenNodeIds: string[],
): TPenPointHoverKind | null => {
  const tangentFromOffset = getTangentFromOffset(pendingOutgoingTangentRef.current, activeVertexId);
  const sameNodeHoverKind = resolveSameNodeHoverPreview(
    point,
    node,
    activeVertex,
    activeVertexId,
    tangentFromOffset,
    viewport,
    penPreviewRef,
    hoveredSegmentIdRef,
    penHoveredDragArmableVertexRef,
    vectorAlignmentGuideRef,
  );

  if (sameNodeHoverKind) {
    return sameNodeHoverKind;
  }

  const crossNodeHoverKind = resolveCrossNodeHoverPreview(
    point,
    otherOpenNodeIds,
    nodes,
    activeVertex,
    tangentFromOffset,
    viewport,
    penPreviewRef,
    hoveredSegmentIdRef,
    penHoveredDragArmableVertexRef,
    vectorAlignmentGuideRef,
  );

  if (crossNodeHoverKind) {
    return crossNodeHoverKind;
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
};
