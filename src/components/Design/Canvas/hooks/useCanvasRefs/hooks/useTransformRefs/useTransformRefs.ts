import { useRef } from 'react';

// types
import { TAlignmentGuide } from 'components/Design/Canvas/utils/getGroupAlignmentGuide';
import { TAspectRatioLockGuide } from 'types/canvas';
import { TDistanceGuides } from 'components/Design/Canvas/utils/getDistanceGuides/types';
import { TEqualSpacingGuides, TMatchedPairGuides } from 'components/Design/Canvas/utils/getEqualSpacingGuides/types';
import { TShapeContactGuide } from 'components/Design/Canvas/utils/getShapeContactGuides';
import { TTransformRefs } from 'types/design/canvas/types';
import { TRotateDragState } from 'types/design/selectionTool/types';

export const useTransformRefs = (): TTransformRefs => {
  const alignmentGuideRef = useRef<TAlignmentGuide | null>(null);
  const aspectRatioLockGuideRef = useRef<TAspectRatioLockGuide | null>(null);
  const contactGuidesRef = useRef<TShapeContactGuide[] | null>(null);
  const distanceGuidesRef = useRef<TDistanceGuides | null>(null);
  const draggedNodeIdsRef = useRef<Set<string> | null>(null);
  const dropTargetFrameIdRef = useRef<string | null>(null);
  const equalSpacingGuidesRef = useRef<TEqualSpacingGuides | null>(null);
  const matchedPairGuidesRef = useRef<TMatchedPairGuides | null>(null);
  const resizedNodeIdsRef = useRef<Set<string> | null>(null);
  const rotateDragRef = useRef<TRotateDragState | null>(null);
  const rotatedNodeIdsRef = useRef<Set<string> | null>(null);
  const transformRefsRef = useRef<TTransformRefs | null>(null);

  if (transformRefsRef.current === null) {
    transformRefsRef.current = {
      alignmentGuideRef,
      aspectRatioLockGuideRef,
      contactGuidesRef,
      distanceGuidesRef,
      draggedNodeIdsRef,
      dropTargetFrameIdRef,
      equalSpacingGuidesRef,
      matchedPairGuidesRef,
      resizedNodeIdsRef,
      rotateDragRef,
      rotatedNodeIdsRef,
    };
  }

  return transformRefsRef.current;
};
