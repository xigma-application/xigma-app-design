import { useRef } from 'react';

// types
import { TVectorCutPreview, TVectorCutRefs } from 'types/design/canvas/types';

export const useVectorCutRefs = (): TVectorCutRefs => {
  const newVectorCutVertexIdsRef = useRef<Set<string>>(new Set());
  const touchedVectorCutVertexIdsRef = useRef<Set<string>>(new Set());
  const vectorCutPreviewRef = useRef<TVectorCutPreview | null>(null);
  const vectorCutRefsRef = useRef<TVectorCutRefs | null>(null);

  if (vectorCutRefsRef.current === null) {
    vectorCutRefsRef.current = { newVectorCutVertexIdsRef, touchedVectorCutVertexIdsRef, vectorCutPreviewRef };
  }

  return vectorCutRefsRef.current;
};
