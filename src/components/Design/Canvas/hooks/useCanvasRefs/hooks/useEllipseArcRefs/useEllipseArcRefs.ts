import { useRef } from 'react';

// types
import { TEllipseArcDragState, TEllipseArcRatioDragState, TEllipseArcRefs, TEllipseArcRotateDragState } from 'types/design/canvas/types';

export const useEllipseArcRefs = (): TEllipseArcRefs => {
  const ellipseArcDragRef = useRef<TEllipseArcDragState | null>(null);
  const ellipseArcRatioDragRef = useRef<TEllipseArcRatioDragState | null>(null);
  const ellipseArcRotateDragRef = useRef<TEllipseArcRotateDragState | null>(null);
  const ellipseArcRefsRef = useRef<TEllipseArcRefs | null>(null);

  if (ellipseArcRefsRef.current === null) {
    ellipseArcRefsRef.current = { ellipseArcDragRef, ellipseArcRatioDragRef, ellipseArcRotateDragRef };
  }

  return ellipseArcRefsRef.current;
};
