import { useRef } from 'react';

// types
import { TStarRatioDragState } from 'types/design/selectionTool/types';
import { TStarRatioRefs } from 'types/design/canvas/types';

export const useStarRatioRefs = (): TStarRatioRefs => {
  const starRatioDragRef = useRef<TStarRatioDragState | null>(null);
  const starRatioRefsRef = useRef<TStarRatioRefs | null>(null);

  if (starRatioRefsRef.current === null) {
    starRatioRefsRef.current = { starRatioDragRef };
  }

  return starRatioRefsRef.current;
};
