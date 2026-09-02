import { useRef } from 'react';

// types
import { TLayoutRefs } from 'types/design/canvas/types';

export const useLayoutRefs = (): TLayoutRefs => {
  const leftPanelWidthRef = useRef<number>(0);
  const rightPanelWidthRef = useRef<number>(0);
  const layoutRefsRef = useRef<TLayoutRefs | null>(null);

  if (layoutRefsRef.current === null) {
    layoutRefsRef.current = { leftPanelWidthRef, rightPanelWidthRef };
  }

  return layoutRefsRef.current;
};
