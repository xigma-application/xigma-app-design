import { useRef } from 'react';

// types
import { TArmedMedia } from 'components/Design/Canvas/hooks/useDrawMediaTool/utils/loadArmedMedia';
import { TMediaRefs } from 'types/design/canvas/types';

export const useMediaRefs = (): TMediaRefs => {
  const armedRef = useRef<TArmedMedia | null>(null);
  const queueRef = useRef<File[]>([]);
  const mediaRefsRef = useRef<TMediaRefs | null>(null);

  if (mediaRefsRef.current === null) {
    mediaRefsRef.current = { armedRef, queueRef };
  }

  return mediaRefsRef.current;
};
