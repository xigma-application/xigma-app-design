import { useRef } from 'react';

// types
import {
  TDragState,
  TEndpointDragState,
  TPathOffsetDragState,
  TPolygonVertexCountDragState,
  TResizeDragState,
  TRotateDragState,
  TSelectionToolRefs,
  TStarRatioDragState,
  TStarVertexCountDragState,
  TVectorHandleDragState,
  TVectorVertexDragState,
} from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';

export const useSelectionToolRefs = (): TSelectionToolRefs => {
  const dragStateRef = useRef<TDragState | null>(null);
  const endpointDragRef = useRef<TEndpointDragState | null>(null);
  const marqueeStartRef = useRef<TPoint | null>(null);
  const pathOffsetDragRef = useRef<TPathOffsetDragState | null>(null);
  const polygonVertexCountDragRef = useRef<TPolygonVertexCountDragState | null>(null);
  const resizeDragRef = useRef<TResizeDragState | null>(null);
  const rotateDragRef = useRef<TRotateDragState | null>(null);
  const starRatioDragRef = useRef<TStarRatioDragState | null>(null);
  const starVertexCountDragRef = useRef<TStarVertexCountDragState | null>(null);
  const vectorHandleDragRef = useRef<TVectorHandleDragState | null>(null);
  const vectorVertexDragRef = useRef<TVectorVertexDragState | null>(null);
  const selectionRefsRef = useRef<TSelectionToolRefs | null>(null);

  if (selectionRefsRef.current === null) {
    selectionRefsRef.current = {
      dragStateRef,
      endpointDragRef,
      marqueeStartRef,
      pathOffsetDragRef,
      polygonVertexCountDragRef,
      resizeDragRef,
      rotateDragRef,
      starRatioDragRef,
      starVertexCountDragRef,
      vectorHandleDragRef,
      vectorVertexDragRef,
    };
  }

  return selectionRefsRef.current;
};
