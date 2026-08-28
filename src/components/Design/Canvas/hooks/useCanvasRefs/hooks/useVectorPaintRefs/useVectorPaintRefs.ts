import { useRef } from 'react';

// types
import { TVectorDraggedFillFaces, TVectorPaintRefs, TVectorPaintTouchedLoopKeys } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const useVectorPaintRefs = (): TVectorPaintRefs => {
  const isVectorPaintRemoveRef = useRef<boolean>(false);
  const touchedVectorPaintLoopKeysRef = useRef<TVectorPaintTouchedLoopKeys>({});
  const vectorPaintPathRef = useRef<TPoint[] | null>(null);
  const vectorPaintTouchedFacesRef = useRef<TVectorDraggedFillFaces | null>(null);
  const vectorPaintRefsRef = useRef<TVectorPaintRefs | null>(null);

  if (vectorPaintRefsRef.current === null) {
    vectorPaintRefsRef.current = {
      isVectorPaintRemoveRef,
      touchedVectorPaintLoopKeysRef,
      vectorPaintPathRef,
      vectorPaintTouchedFacesRef,
    };
  }

  return vectorPaintRefsRef.current;
};
