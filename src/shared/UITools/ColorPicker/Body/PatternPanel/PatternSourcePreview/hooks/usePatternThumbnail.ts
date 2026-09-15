import { useEffect, useState } from 'react';

// utils
import { samplePatternThumbnail } from 'utils/canvas/patternThumbnail/patternThumbnailRegistry';

const PATTERN_THUMBNAIL_SIZE = 256;

export const usePatternThumbnail = (sourceNodeId: string | null | undefined): string | null => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (sourceNodeId) {
      samplePatternThumbnail(sourceNodeId, PATTERN_THUMBNAIL_SIZE).then((dataUrl) => {
        if (!isCancelled) {
          setThumbnailUrl(dataUrl);
        }
      });
    } else {
      setThumbnailUrl(null);
    }

    return (): void => {
      isCancelled = true;
    };
  }, [sourceNodeId]);

  return thumbnailUrl;
};
