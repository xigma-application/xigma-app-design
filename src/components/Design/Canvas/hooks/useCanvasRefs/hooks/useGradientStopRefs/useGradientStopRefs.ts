import { useRef } from 'react';

// types
import { TGradientStopDragState, TGradientStopRefs } from 'types/design/canvas/types';

export const useGradientStopRefs = (): TGradientStopRefs => {
  const gradientStopDragRef = useRef<TGradientStopDragState | null>(null);
  const gradientStopRefsRef = useRef<TGradientStopRefs | null>(null);

  if (gradientStopRefsRef.current === null) {
    gradientStopRefsRef.current = { gradientStopDragRef };
  }

  return gradientStopRefsRef.current;
};
