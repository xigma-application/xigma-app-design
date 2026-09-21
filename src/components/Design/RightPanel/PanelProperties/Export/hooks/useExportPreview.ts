import { useEffect, useState } from 'react';

// others
import { EXPORT_PREVIEW_SIZE } from '../constants';

// utils
import { samplePatternThumbnail } from 'utils/canvas/patternThumbnail/patternThumbnailRegistry';

export const useExportPreview = (nodeId: string | undefined): string | null => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (nodeId) {
      samplePatternThumbnail(nodeId, EXPORT_PREVIEW_SIZE).then((dataUrl) => {
        if (!isCancelled) {
          setPreviewUrl(dataUrl);
        }
      });
    } else {
      setPreviewUrl(null);
    }

    return (): void => {
      isCancelled = true;
    };
  }, [nodeId]);

  return previewUrl;
};
