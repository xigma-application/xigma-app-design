import { useRef } from 'react';

// types
import { TPencilRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const usePencilRefs = (): TPencilRefs => {
  const pencilPreviewPointsRef = useRef<TPoint[] | null>(null);
  const pencilRawPreviewPointsRef = useRef<TPoint[] | null>(null);
  const pencilShowRawPreviewRef = useRef<boolean>(false);
  const pencilRefsRef = useRef<TPencilRefs | null>(null);

  if (pencilRefsRef.current === null) {
    pencilRefsRef.current = { pencilPreviewPointsRef, pencilRawPreviewPointsRef, pencilShowRawPreviewRef };
  }

  return pencilRefsRef.current;
};
