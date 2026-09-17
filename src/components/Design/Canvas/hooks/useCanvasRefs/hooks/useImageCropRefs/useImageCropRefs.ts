import { useRef } from 'react';

// types
import {
  TImageCropMoveDragState,
  TImageCropRefs,
  TImageCropResizeDragState,
  TImageCropRotateDragState,
  TImageTileScaleDragState,
} from 'types/design/canvas/types';

export const useImageCropRefs = (): TImageCropRefs => {
  const imageCropMoveDragRef = useRef<TImageCropMoveDragState | null>(null);
  const imageCropResizeDragRef = useRef<TImageCropResizeDragState | null>(null);
  const imageCropRotateDragRef = useRef<TImageCropRotateDragState | null>(null);
  const imageTileScaleDragRef = useRef<TImageTileScaleDragState | null>(null);
  const imageCropRefsRef = useRef<TImageCropRefs | null>(null);

  if (imageCropRefsRef.current === null) {
    imageCropRefsRef.current = { imageCropMoveDragRef, imageCropResizeDragRef, imageCropRotateDragRef, imageTileScaleDragRef };
  }

  return imageCropRefsRef.current;
};
