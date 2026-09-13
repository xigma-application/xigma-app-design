import { useRef } from 'react';

// types
import { TBlendModePreview, TBlendModeRefs } from 'types/design/canvas/types';

export const useBlendModeRefs = (): TBlendModeRefs => {
  const previewRef = useRef<TBlendModePreview | null>(null);
  const blendModeRefsRef = useRef<TBlendModeRefs | null>(null);

  if (blendModeRefsRef.current === null) {
    blendModeRefsRef.current = { previewRef };
  }

  return blendModeRefsRef.current;
};
