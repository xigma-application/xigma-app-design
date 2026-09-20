import { useRef } from 'react';

// types
import { TBlendModePreview, TBlendModeRefs, TEffectBlendModePreview } from 'types/design/canvas/types';

export const useBlendModeRefs = (): TBlendModeRefs => {
  const previewRef = useRef<TBlendModePreview | null>(null);
  const effectPreviewRef = useRef<TEffectBlendModePreview | null>(null);
  const blendModeRefsRef = useRef<TBlendModeRefs | null>(null);

  if (blendModeRefsRef.current === null) {
    blendModeRefsRef.current = { effectPreviewRef, previewRef };
  }

  return blendModeRefsRef.current;
};
