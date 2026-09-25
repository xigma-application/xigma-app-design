import { useRef } from 'react';

// types
import { TOffsetVectorDragState } from 'types/design/selectionTool/types';
import { TOffsetVectorEdgeHit } from 'utils/canvas/offsetVector/types';
import { TOffsetVectorRefs } from 'types/design/canvas/types';

export const useOffsetVectorRefs = (): TOffsetVectorRefs => {
  const hoveredOffsetVectorEdgeRef = useRef<TOffsetVectorEdgeHit | null>(null);
  const offsetVectorDragRef = useRef<TOffsetVectorDragState | null>(null);
  const offsetVectorRefsRef = useRef<TOffsetVectorRefs | null>(null);

  if (offsetVectorRefsRef.current === null) {
    offsetVectorRefsRef.current = { hoveredOffsetVectorEdgeRef, offsetVectorDragRef };
  }

  return offsetVectorRefsRef.current;
};
