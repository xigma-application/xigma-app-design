import { useEffect } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { registerPatternThumbnailSampler } from 'utils/canvas/patternThumbnail/patternThumbnailRegistry';

export const useRegisterPatternThumbnailSampler = (refs: TCanvasRefs): void => {
  useEffect(() => {
    const sampleThumbnail = (sourceNodeId: string, size: number): Promise<string | null> =>
      new Promise((resolve) => {
        refs.patternThumbnailRequestRef.current = { onResolve: resolve, size, sourceNodeId };
      });

    return registerPatternThumbnailSampler(sampleThumbnail);
  }, [refs]);
};
