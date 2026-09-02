import { useRef } from 'react';

// types
import { TGuideDragState, TGuideRefs } from 'types/design/canvas/types';

export const useGuideRefs = (): TGuideRefs => {
  const draggingGuideRef = useRef<TGuideDragState | null>(null);
  const guideRefsRef = useRef<TGuideRefs | null>(null);

  if (guideRefsRef.current === null) {
    guideRefsRef.current = { draggingGuideRef };
  }

  return guideRefsRef.current;
};
