import { useRef } from 'react';

// types
import { TSmartSelectionGapDragState, TSmartSelectionRefs } from 'types/design/canvas/types';

export const useSmartSelectionRefs = (): TSmartSelectionRefs => {
  const gapDragRef = useRef<TSmartSelectionGapDragState | null>(null);
  const smartSelectionRefsRef = useRef<TSmartSelectionRefs | null>(null);

  if (smartSelectionRefsRef.current === null) {
    smartSelectionRefsRef.current = { gapDragRef };
  }

  return smartSelectionRefsRef.current;
};
