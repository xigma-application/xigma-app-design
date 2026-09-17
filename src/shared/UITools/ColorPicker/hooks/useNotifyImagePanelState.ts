import { useEffect, useRef } from 'react';

// types
import { TImagePanelChange } from '../Body/ImagePanel/types';
import { TUseImagePanelResult } from '../Body/ImagePanel/hooks/useImagePanel';

export const useNotifyImagePanelState = (
  imagePanel: TUseImagePanelResult,
  onImageUrlChange?: TFunc<[string | null]>,
  onImageChange?: TFunc<[TImagePanelChange]>,
): void => {
  const notifiedImageUrlRef = useRef<string | null>(imagePanel.imageUrl);

  useEffect(() => {
    onImageUrlChange?.(imagePanel.imageUrl);

    if (imagePanel.imageUrl && notifiedImageUrlRef.current !== imagePanel.imageUrl) {
      notifiedImageUrlRef.current = imagePanel.imageUrl;
      onImageChange?.({ ref: imagePanel.imageUrl, scaleMode: imagePanel.fillMode === 'fit' ? 'fit' : 'fill' });
    }
  }, [imagePanel.imageUrl, onImageChange, onImageUrlChange]);
};
