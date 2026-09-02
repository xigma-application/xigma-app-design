import { useRef } from 'react';

// types
import {
  TDragState,
  TEndpointDragState,
  TPathOffsetDragState,
  TPendingVectorCornerHandleDragState,
  TResizeDragState,
  TSelectionToolRefs,
  TVectorCutDragState,
  TVectorEraseDragState,
  TVectorHandleDragState,
  TVectorMarqueeMode,
  TVectorSegmentBendDragState,
  TVectorVertexDragState,
} from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';

export const useSelectionToolRefs = (): TSelectionToolRefs => {
  const dragStateRef = useRef<TDragState | null>(null);
  const endpointDragRef = useRef<TEndpointDragState | null>(null);
  const marqueeStartRef = useRef<TPoint | null>(null);
  const pathOffsetDragRef = useRef<TPathOffsetDragState | null>(null);
  const pendingVectorCornerHandleDragRef = useRef<TPendingVectorCornerHandleDragState | null>(null);
  const resizeDragRef = useRef<TResizeDragState | null>(null);
  const vectorCutDragRef = useRef<TVectorCutDragState | null>(null);
  const vectorEraseDragRef = useRef<TVectorEraseDragState | null>(null);
  const vectorHandleDragRef = useRef<TVectorHandleDragState | null>(null);
  const vectorMarqueeModeRef = useRef<TVectorMarqueeMode | null>(null);
  const vectorMarqueeStartRef = useRef<TPoint | null>(null);
  const vectorSegmentBendDragRef = useRef<TVectorSegmentBendDragState | null>(null);
  const vectorVertexDragRef = useRef<TVectorVertexDragState | null>(null);
  const selectionRefsRef = useRef<TSelectionToolRefs | null>(null);

  if (selectionRefsRef.current === null) {
    selectionRefsRef.current = {
      dragStateRef,
      endpointDragRef,
      marqueeStartRef,
      pathOffsetDragRef,
      pendingVectorCornerHandleDragRef,
      resizeDragRef,
      vectorCutDragRef,
      vectorEraseDragRef,
      vectorHandleDragRef,
      vectorMarqueeModeRef,
      vectorMarqueeStartRef,
      vectorSegmentBendDragRef,
      vectorVertexDragRef,
    };
  }

  return selectionRefsRef.current;
};
