import { useRef } from 'react';

// types
import { TProgressiveBlurDragState, TProgressiveBlurEndpoint, TProgressiveBlurRefs } from 'types/design/canvas/types';

export const useProgressiveBlurRefs = (): TProgressiveBlurRefs => {
  const dragRef = useRef<TProgressiveBlurDragState | null>(null);
  const hoveredEndpointRef = useRef<TProgressiveBlurEndpoint | null>(null);
  const progressiveBlurRefsRef = useRef<TProgressiveBlurRefs | null>(null);

  if (progressiveBlurRefsRef.current === null) {
    progressiveBlurRefsRef.current = { dragRef, hoveredEndpointRef };
  }

  return progressiveBlurRefsRef.current;
};
