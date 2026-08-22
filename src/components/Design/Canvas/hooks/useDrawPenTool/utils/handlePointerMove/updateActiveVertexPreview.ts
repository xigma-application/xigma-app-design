import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode, TViewport } from 'types/design/types';

// utils
import { getPenHoverCursorClassName } from './getPenHoverCursorClassName';
import { updateVectorPenPreview } from './updateVectorPenPreview/updateVectorPenPreview';

export const updateActiveVertexPreview = (
  point: TPoint,
  node: TVectorNode,
  nodes: Record<string, TSceneNode>,
  activeVertexId: string,
  viewport: TViewport,
  isShiftPressed: boolean,
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TCanvasRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
  otherOpenNodeIds: string[],
  penNewVertexPreviewRef: TCanvasRefs['penNewVertexPreviewRef'],
  setClassName: (className: string | null) => void,
): void => {
  const hoverKind = updateVectorPenPreview(
    point,
    node,
    nodes,
    activeVertexId,
    viewport,
    isShiftPressed,
    penPreviewRef,
    pendingOutgoingTangentRef,
    hoveredSegmentIdRef,
    penHoveredDragArmableVertexRef,
    vectorAlignmentGuideRef,
    otherOpenNodeIds,
  );

  penNewVertexPreviewRef.current = null;
  setClassName(getPenHoverCursorClassName(hoverKind));
};
