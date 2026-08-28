import { useRef } from 'react';

// types
import { TVectorEraseRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// others
import { ERASER_DEFAULT_DIAMETER_PX } from 'constant/canvas';

export const useVectorEraseRefs = (): TVectorEraseRefs => {
  const eraseBrushCenterRef = useRef<TPoint | null>(null);
  const eraserDiameterRef = useRef<number>(ERASER_DEFAULT_DIAMETER_PX);
  const vectorEraseStrokeRef = useRef<TPoint[] | null>(null);
  const vectorEraseRefsRef = useRef<TVectorEraseRefs | null>(null);

  if (vectorEraseRefsRef.current === null) {
    vectorEraseRefsRef.current = { eraseBrushCenterRef, eraserDiameterRef, vectorEraseStrokeRef };
  }

  return vectorEraseRefsRef.current;
};
