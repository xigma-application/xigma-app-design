import { useRef } from 'react';

// types
import { TGradientRotateDragState, TGradientRotateRefs } from 'types/design/canvas/types';

export const useGradientRotateRefs = (): TGradientRotateRefs => {
  const gradientRotateDragRef = useRef<TGradientRotateDragState | null>(null);
  const gradientRotateRefsRef = useRef<TGradientRotateRefs | null>(null);

  if (gradientRotateRefsRef.current === null) {
    gradientRotateRefsRef.current = { gradientRotateDragRef };
  }

  return gradientRotateRefsRef.current;
};
