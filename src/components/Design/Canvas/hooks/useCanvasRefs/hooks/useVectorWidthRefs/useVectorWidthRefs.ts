import { useRef } from 'react';

// types
import { TVectorWidthLabelEditTarget, TVectorWidthPointDragState, TVectorWidthRefs } from 'types/design/canvas/types';

export const useVectorWidthRefs = (): TVectorWidthRefs => {
  const editingWidthLabelRef = useRef<TVectorWidthLabelEditTarget | null>(null);
  const vectorWidthPointDragRef = useRef<TVectorWidthPointDragState | null>(null);
  const vectorWidthRefsRef = useRef<TVectorWidthRefs | null>(null);

  if (vectorWidthRefsRef.current === null) {
    vectorWidthRefsRef.current = { editingWidthLabelRef, vectorWidthPointDragRef };
  }

  return vectorWidthRefsRef.current;
};
