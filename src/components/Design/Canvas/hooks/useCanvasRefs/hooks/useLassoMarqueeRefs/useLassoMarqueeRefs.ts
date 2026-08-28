import { useRef } from 'react';

// types
import { TLassoMarqueeRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';

export const useLassoMarqueeRefs = (): TLassoMarqueeRefs => {
  const marqueeRef = useRef<TDraftRect | null>(null);
  const vectorLassoPathRef = useRef<TPoint[] | null>(null);
  const lassoMarqueeRefsRef = useRef<TLassoMarqueeRefs | null>(null);

  if (lassoMarqueeRefsRef.current === null) {
    lassoMarqueeRefsRef.current = { marqueeRef, vectorLassoPathRef };
  }

  return lassoMarqueeRefsRef.current;
};
