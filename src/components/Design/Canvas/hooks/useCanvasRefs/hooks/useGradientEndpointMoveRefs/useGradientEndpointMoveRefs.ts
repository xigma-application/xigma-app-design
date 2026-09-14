import { useRef } from 'react';

// types
import { TGradientEndpointMoveDragState, TGradientEndpointMoveRefs } from 'types/design/canvas/types';

export const useGradientEndpointMoveRefs = (): TGradientEndpointMoveRefs => {
  const gradientEndpointMoveDragRef = useRef<TGradientEndpointMoveDragState | null>(null);
  const gradientEndpointMoveRefsRef = useRef<TGradientEndpointMoveRefs | null>(null);

  if (gradientEndpointMoveRefsRef.current === null) {
    gradientEndpointMoveRefsRef.current = { gradientEndpointMoveDragRef };
  }

  return gradientEndpointMoveRefsRef.current;
};
