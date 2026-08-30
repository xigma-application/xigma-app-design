import { useRef } from 'react';

// types
import { TShapeContactGuide } from 'components/Design/Canvas/utils/getShapeContactGuides';
import { TTransformRefs } from 'types/design/canvas/types';
import { TRotateDragState } from 'types/design/selectionTool/types';

export const useTransformRefs = (): TTransformRefs => {
  const contactGuidesRef = useRef<TShapeContactGuide[] | null>(null);
  const draggedNodeIdsRef = useRef<Set<string> | null>(null);
  const resizedNodeIdsRef = useRef<Set<string> | null>(null);
  const rotateDragRef = useRef<TRotateDragState | null>(null);
  const rotatedNodeIdsRef = useRef<Set<string> | null>(null);
  const transformRefsRef = useRef<TTransformRefs | null>(null);

  if (transformRefsRef.current === null) {
    transformRefsRef.current = { contactGuidesRef, draggedNodeIdsRef, resizedNodeIdsRef, rotateDragRef, rotatedNodeIdsRef };
  }

  return transformRefsRef.current;
};
