import { useRef } from 'react';

// types
import { TSmartSelectionGapDragState, TSmartSelectionRefs, TSmartSelectionSwapDragState } from 'types/design/canvas/types';

export const useSmartSelectionRefs = (): TSmartSelectionRefs => {
  const gapDragRef = useRef<TSmartSelectionGapDragState | null>(null);
  const swapDragRef = useRef<TSmartSelectionSwapDragState | null>(null);
  const smartSelectionRefsRef = useRef<TSmartSelectionRefs | null>(null);

  if (smartSelectionRefsRef.current === null) {
    smartSelectionRefsRef.current = { gapDragRef, swapDragRef };
  }

  return smartSelectionRefsRef.current;
};
