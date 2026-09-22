import { useEffect, useState } from 'react';

// others
import { EXPORT_PREVIEW_SIZE } from '../constants';

// utils
import { samplePatternThumbnail } from 'utils/canvas/patternThumbnail/patternThumbnailRegistry';

export const useExportPreview = (nodeId: string | null): string | null => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    samplePatternThumbnail(nodeId, EXPORT_PREVIEW_SIZE).then((dataUrl) => {
      if (!isCancelled) {
        setPreviewUrl(dataUrl);
      }
    });

    return (): void => {
      isCancelled = true;
    };
  }, [nodeId]);

  return previewUrl;
};
