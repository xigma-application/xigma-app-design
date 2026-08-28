import { useRef } from 'react';

// types
import { TPenPreview, TPenRefs } from 'types/design/canvas/types';
import { TPenDragOrigin } from 'components/Design/Canvas/hooks/useDrawPenTool/types';
import { TPoint } from 'types/canvas';

export const usePenRefs = (): TPenRefs => {
  const penDragOriginRef = useRef<TPenDragOrigin | null>(null);
  const penDraggedHandleIsSnappedRef = useRef<boolean>(false);
  const penDraggedHandlePositionRef = useRef<TPoint | null>(null);
  const penHoveredDragArmableVertexRef = useRef<boolean>(false);
  const penNewVertexPreviewRef = useRef<TPoint | null>(null);
  const penPreviewRef = useRef<TPenPreview | null>(null);
  const penRefsRef = useRef<TPenRefs | null>(null);

  if (penRefsRef.current === null) {
    penRefsRef.current = {
      penDragOriginRef,
      penDraggedHandleIsSnappedRef,
      penDraggedHandlePositionRef,
      penHoveredDragArmableVertexRef,
      penNewVertexPreviewRef,
      penPreviewRef,
    };
  }

  return penRefsRef.current;
};
