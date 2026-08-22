// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { getPenHoverCursorClassName } from './getPenHoverCursorClassName';
import { updateNewVertexPreview } from './updateNewVertexPreview';

export const updateNoActiveVertexPreview = (
  point: TPoint,
  node: TVectorNode | null,
  viewport: TViewport,
  penNewVertexPreviewRef: TCanvasRefs['penNewVertexPreviewRef'],
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TCanvasRefs['penHoveredDragArmableVertexRef'],
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
  setClassName: (className: string | null) => void,
): void => {
  const hoverKind = updateNewVertexPreview(
    point,
    node,
    viewport,
    penNewVertexPreviewRef,
    hoveredSegmentIdRef,
    penHoveredDragArmableVertexRef,
  );

  penPreviewRef.current = null;
  vectorAlignmentGuideRef.current = null;
  setClassName(getPenHoverCursorClassName(hoverKind));
};
