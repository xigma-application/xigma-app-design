import { useRef } from 'react';

// types
import {
  TCanvasRefs,
  TCornerRadiusDragState,
  TEllipseArcDragState,
  TEllipseArcRatioDragState,
  TEllipseArcRotateDragState,
  TPolygonCornerRadiusDragState,
  TSliceDraft,
  TStarCornerRadiusDragState,
} from 'types/design/canvas/types';
import { TDraftEntity } from 'types/design/types';
import { TDraftRect } from 'types/canvas';

export const useCanvasRefs = (): TCanvasRefs => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cornerRadiusDragRef = useRef<TCornerRadiusDragState | null>(null);
  const draftRef = useRef<TDraftEntity | null>(null);
  const ellipseArcDragRef = useRef<TEllipseArcDragState | null>(null);
  const ellipseArcRatioDragRef = useRef<TEllipseArcRatioDragState | null>(null);
  const ellipseArcRotateDragRef = useRef<TEllipseArcRotateDragState | null>(null);
  const hoverRef = useRef<string | null>(null);
  const marqueeRef = useRef<TDraftRect | null>(null);
  const polygonCornerRadiusDragRef = useRef<TPolygonCornerRadiusDragState | null>(null);
  const sliceRef = useRef<TSliceDraft | null>(null);
  const starCornerRadiusDragRef = useRef<TStarCornerRadiusDragState | null>(null);
  const refsRef = useRef<TCanvasRefs | null>(null);

  if (refsRef.current === null) {
    refsRef.current = {
      canvasRef,
      cornerRadiusDragRef,
      draftRef,
      ellipseArcDragRef,
      ellipseArcRatioDragRef,
      ellipseArcRotateDragRef,
      hoverRef,
      marqueeRef,
      polygonCornerRadiusDragRef,
      sliceRef,
      starCornerRadiusDragRef,
    };
  }

  return refsRef.current;
};
