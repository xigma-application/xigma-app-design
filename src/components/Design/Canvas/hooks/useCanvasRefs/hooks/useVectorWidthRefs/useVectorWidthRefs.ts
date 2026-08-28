import { useRef } from 'react';

// types
import { TVectorWidthPointDragState, TVectorWidthRefs } from 'types/design/canvas/types';

export const useVectorWidthRefs = (): TVectorWidthRefs => {
  const vectorWidthPointDragRef = useRef<TVectorWidthPointDragState | null>(null);
  const vectorWidthRefsRef = useRef<TVectorWidthRefs | null>(null);

  if (vectorWidthRefsRef.current === null) {
    vectorWidthRefsRef.current = { vectorWidthPointDragRef };
  }

  return vectorWidthRefsRef.current;
};
