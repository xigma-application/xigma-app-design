import { useRef } from 'react';

// types
import {
  THoverRefs,
  TVectorCutSegmentHover,
  TVectorFaceHover,
  TVectorHandleHover,
  TVectorPaintFaceHover,
  TVectorWidthPointHover,
} from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const useHoverRefs = (): THoverRefs => {
  const hoverRef = useRef<string | null>(null);
  const hoveredEllipseArcHandleRef = useRef<string | null>(null);
  const hoveredEllipseArcRotateHandleRef = useRef<string | null>(null);
  const hoveredSegmentIdRef = useRef<string | null>(null);
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
  const hoverRefsRef = useRef<THoverRefs | null>(null);

  if (hoverRefsRef.current === null) {
    hoverRefsRef.current = {
      hoverRef,
      hoveredEllipseArcHandleRef,
      hoveredEllipseArcRotateHandleRef,
      hoveredSegmentIdRef,
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
    };
  }

  return hoverRefsRef.current;
};
