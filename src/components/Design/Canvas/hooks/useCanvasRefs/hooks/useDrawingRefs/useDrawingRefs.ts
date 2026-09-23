import { useRef } from 'react';

// types
import { TDrawingRefs } from 'types/design/canvas/types';

export const useDrawingRefs = (): TDrawingRefs => {
  const cancelDrawRef = useRef<(() => void) | null>(null);
  const drawingRefsRef = useRef<TDrawingRefs | null>(null);

  if (drawingRefsRef.current === null) {
    drawingRefsRef.current = { cancelDrawRef };
  }

  return drawingRefsRef.current;
};
