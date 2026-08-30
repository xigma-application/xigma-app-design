import { useRef } from 'react';

// types
import { TFrameNameRefs } from 'types/design/canvas/types';

export const useFrameNameRefs = (): TFrameNameRefs => {
  const editingLabelRef = useRef<string | null>(null);
  const frameNameRefsRef = useRef<TFrameNameRefs | null>(null);

  if (frameNameRefsRef.current === null) {
    frameNameRefsRef.current = { editingLabelRef };
  }

  return frameNameRefsRef.current;
};
