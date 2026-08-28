// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const clearPenPreviewRefs = (refs: TCanvasRefs): void => {
  refs.pen.penPreviewRef.current = null;
  refs.pen.penNewVertexPreviewRef.current = null;
  refs.pen.penDragOriginRef.current = null;
  refs.pen.penDraggedHandlePositionRef.current = null;
  refs.pen.penDraggedHandleIsSnappedRef.current = false;
  refs.vectorEdit.vectorAlignmentGuideRef.current = null;
};
