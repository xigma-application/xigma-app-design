import { useRef } from 'react';

// types
import { TGradientRadiusDragState, TGradientRadiusRefs } from 'types/design/canvas/types';

export const useGradientRadiusRefs = (): TGradientRadiusRefs => {
  const gradientRadiusDragRef = useRef<TGradientRadiusDragState | null>(null);
  const gradientRadiusRefsRef = useRef<TGradientRadiusRefs | null>(null);

  if (gradientRadiusRefsRef.current === null) {
    gradientRadiusRefsRef.current = { gradientRadiusDragRef };
  }

  return gradientRadiusRefsRef.current;
};
