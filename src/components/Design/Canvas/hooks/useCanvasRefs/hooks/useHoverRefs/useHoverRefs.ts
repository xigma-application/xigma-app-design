import { useRef } from 'react';

// types
import {
  TCornerRadiusHandleHover,
  THoverRefs,
  TSmartSelectionGapHoverState,
  TSmartSelectionSwapHoverState,
  TVectorCutSegmentHover,
  TVectorFaceHover,
  TVectorHandleHover,
  TVectorPaintFaceHover,
  TVectorWidthPointHover,
} from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const useHoverRefs = (): THoverRefs => {
  const hoverRef = useRef<string | null>(null);
  const hoveredCornerRadiusHandleRef = useRef<TCornerRadiusHandleHover | null>(null);
  const hoveredEllipseArcHandleRef = useRef<string | null>(null);
  const hoveredEllipseArcRatioHandleRef = useRef<string | null>(null);
  const hoveredEllipseArcRotateHandleRef = useRef<string | null>(null);
  const hoveredPolygonCornerRadiusHandleRef = useRef<string | null>(null);
  const hoveredPolygonVertexCountHandleRef = useRef<string | null>(null);
  const hoveredSegmentIdRef = useRef<string | null>(null);
  const hoveredSmartSelectionGapRef = useRef<TSmartSelectionGapHoverState | null>(null);
  const hoveredSmartSelectionSwapRef = useRef<TSmartSelectionSwapHoverState | null>(null);
  const hoveredStarCornerRadiusHandleRef = useRef<string | null>(null);
  const hoveredStarRatioHandleRef = useRef<string | null>(null);
  const hoveredStarVertexCountHandleRef = useRef<string | null>(null);
  const hoveredVectorCutPointRef = useRef<TPoint | null>(null);
  const hoveredVectorCutSegmentRef = useRef<TVectorCutSegmentHover | null>(null);
  const hoveredVectorEdgeInsertPointRef = useRef<TPoint | null>(null);
  const hoveredVectorFaceSelectRef = useRef<TVectorFaceHover | null>(null);
  const hoveredVectorHandleRef = useRef<TVectorHandleHover | null>(null);
  const hoveredVectorPaintFaceKeyRef = useRef<TVectorPaintFaceHover | null>(null);
  const hoveredVectorSegmentIdRef = useRef<string | null>(null);
  const hoveredVectorShapeBuilderFaceRef = useRef<TVectorFaceHover | null>(null);
  const hoveredVectorVertexIdRef = useRef<string | null>(null);
  const hoveredVectorWidthLabelRef = useRef<TVectorWidthPointHover | null>(null);
  const hoveredVectorWidthPointRef = useRef<TVectorWidthPointHover | null>(null);
  const isSmartSelectionBoxHoveredRef = useRef(false);
  const hoverRefsRef = useRef<THoverRefs | null>(null);

  if (hoverRefsRef.current === null) {
    hoverRefsRef.current = {
      hoverRef,
      hoveredCornerRadiusHandleRef,
      hoveredEllipseArcHandleRef,
      hoveredEllipseArcRatioHandleRef,
      hoveredEllipseArcRotateHandleRef,
      hoveredPolygonCornerRadiusHandleRef,
      hoveredPolygonVertexCountHandleRef,
      hoveredSegmentIdRef,
      hoveredSmartSelectionGapRef,
      hoveredSmartSelectionSwapRef,
      hoveredStarCornerRadiusHandleRef,
      hoveredStarRatioHandleRef,
      hoveredStarVertexCountHandleRef,
      hoveredVectorCutPointRef,
      hoveredVectorCutSegmentRef,
      hoveredVectorEdgeInsertPointRef,
      hoveredVectorFaceSelectRef,
      hoveredVectorHandleRef,
      hoveredVectorPaintFaceKeyRef,
      hoveredVectorSegmentIdRef,
      hoveredVectorShapeBuilderFaceRef,
      hoveredVectorVertexIdRef,
      hoveredVectorWidthLabelRef,
      hoveredVectorWidthPointRef,
      isSmartSelectionBoxHoveredRef,
    };
  }

  return hoverRefsRef.current;
};
