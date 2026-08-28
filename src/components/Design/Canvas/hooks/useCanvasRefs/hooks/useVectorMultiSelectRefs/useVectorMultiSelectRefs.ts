import { useRef } from 'react';

// types
import { TVectorMultiSelectBox, TVectorMultiSelectRefs } from 'types/design/canvas/types';
import {
  TVectorMultiDragState,
  TVectorMultiSelectResizeDragState,
  TVectorMultiSelectRotateDragState,
} from 'types/design/selectionTool/types';

export const useVectorMultiSelectRefs = (): TVectorMultiSelectRefs => {
  const vectorMultiDragRef = useRef<TVectorMultiDragState | null>(null);
  const vectorMultiSelectBoxRef = useRef<TVectorMultiSelectBox | null>(null);
  const vectorMultiSelectResizeDragRef = useRef<TVectorMultiSelectResizeDragState | null>(null);
  const vectorMultiSelectRotateDragRef = useRef<TVectorMultiSelectRotateDragState | null>(null);
  const vectorMultiSelectRefsRef = useRef<TVectorMultiSelectRefs | null>(null);

  if (vectorMultiSelectRefsRef.current === null) {
    vectorMultiSelectRefsRef.current = {
      vectorMultiDragRef,
      vectorMultiSelectBoxRef,
      vectorMultiSelectResizeDragRef,
      vectorMultiSelectRotateDragRef,
    };
  }

  return vectorMultiSelectRefsRef.current;
};
