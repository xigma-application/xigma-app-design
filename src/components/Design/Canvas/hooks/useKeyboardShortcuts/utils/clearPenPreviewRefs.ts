// types
import { TCanvasRefs } from 'types/design/canvas/types';

// the staged tangent-preview line/handle lives in plain refs, written only by the canvas's own
// pointermove handler (updateVectorPenPreview.ts) — a Redux dispatch alone never touches them, so
// without this they stay rendered as stale until the next real pointermove clears them
export const clearPenPreviewRefs = (refs: TCanvasRefs): void => {
  refs.penPreviewRef.current = null;
  refs.penNewVertexPreviewRef.current = null;
  refs.penDragOriginRef.current = null;
  refs.penDraggedHandlePositionRef.current = null;
  refs.penDraggedHandleIsSnappedRef.current = false;
  refs.vectorAlignmentGuideRef.current = null;
};
