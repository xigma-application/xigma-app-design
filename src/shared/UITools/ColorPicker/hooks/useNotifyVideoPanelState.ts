import { useEffect, useRef } from 'react';

// types
import { TUseVideoPanelResult } from '../Body/VideoPanel/hooks/useVideoPanel';
import { TVideoPanelChange } from '../Body/VideoPanel/types';

export const useNotifyVideoPanelState = (
  videoPanel: TUseVideoPanelResult,
  onVideoUrlChange?: TFunc<[string | null]>,
  onVideoChange?: TFunc<[TVideoPanelChange]>,
): void => {
  const notifiedVideoUrlRef = useRef<string | null>(videoPanel.videoUrl);

  useEffect(() => {
    onVideoUrlChange?.(videoPanel.videoUrl);

    if (videoPanel.videoUrl && notifiedVideoUrlRef.current !== videoPanel.videoUrl) {
      notifiedVideoUrlRef.current = videoPanel.videoUrl;
      onVideoChange?.({ ref: videoPanel.videoUrl, scaleMode: videoPanel.fillMode === 'fit' ? 'fit' : 'fill' });
    }
  }, [videoPanel.videoUrl, onVideoChange, onVideoUrlChange]);
};
