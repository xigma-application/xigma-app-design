import { useRef } from 'react';

// types
import { TGuideDragState, TGuideIdentity, TGuideRefs } from 'types/design/canvas/types';

export const useGuideRefs = (): TGuideRefs => {
  const draggingGuideRef = useRef<TGuideDragState | null>(null);
  const hoveredGuideRef = useRef<TGuideIdentity | null>(null);
  const selectedGuideRef = useRef<TGuideIdentity | null>(null);
  const guideRefsRef = useRef<TGuideRefs | null>(null);

  if (guideRefsRef.current === null) {
    guideRefsRef.current = { draggingGuideRef, hoveredGuideRef, selectedGuideRef };
  }

  return guideRefsRef.current;
};
