import { useRef } from 'react';

// types
import { TSliceDraft, TSliceRefs } from 'types/design/canvas/types';

export const useSliceRefs = (): TSliceRefs => {
  const sliceRef = useRef<TSliceDraft | null>(null);
  const sliceRefsRef = useRef<TSliceRefs | null>(null);

  if (sliceRefsRef.current === null) {
    sliceRefsRef.current = { sliceRef };
  }

  return sliceRefsRef.current;
};
