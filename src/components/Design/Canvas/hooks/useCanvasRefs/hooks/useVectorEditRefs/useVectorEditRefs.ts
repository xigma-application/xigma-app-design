import { useRef } from 'react';

// types
import { TVectorEditRefs, TVectorHandleHover, TVectorWidthHandleSelection, TVectorWidthLastHandleSide } from 'types/design/canvas/types';
import { TVectorAlignmentGuide } from 'components/Design/Canvas/utils/applyVectorPointSnapping';

export const useVectorEditRefs = (): TVectorEditRefs => {
  const lastVectorWidthHandleSideRef = useRef<TVectorWidthLastHandleSide | null>(null);
  const preVectorMarqueeSegmentIdsRef = useRef<string[]>([]);
  const preVectorMarqueeVertexIdsRef = useRef<string[]>([]);
  const selectedVectorHandlesRef = useRef<TVectorHandleHover[]>([]);
  const selectedVectorSegmentIdsRef = useRef<string[]>([]);
  const selectedVectorVertexIdsRef = useRef<string[]>([]);
  const selectedVectorWidthHandlesRef = useRef<TVectorWidthHandleSelection[]>([]);
  const snappedVectorHandleRef = useRef<TVectorHandleHover | null>(null);
  const vectorAlignmentGuideRef = useRef<TVectorAlignmentGuide | null>(null);
  const vectorEditRefsRef = useRef<TVectorEditRefs | null>(null);

  if (vectorEditRefsRef.current === null) {
    vectorEditRefsRef.current = {
      lastVectorWidthHandleSideRef,
      preVectorMarqueeSegmentIdsRef,
      preVectorMarqueeVertexIdsRef,
      selectedVectorHandlesRef,
      selectedVectorSegmentIdsRef,
      selectedVectorVertexIdsRef,
      selectedVectorWidthHandlesRef,
      snappedVectorHandleRef,
      vectorAlignmentGuideRef,
    };
  }

  return vectorEditRefsRef.current;
};
