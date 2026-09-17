import { useState } from 'react';

// store
import { selectImageEditor } from 'store/design/selectors';
import { useAppSelector } from 'store';

// others
import { ZOOM_SLIDER_DEFAULT } from '../constants';

export type TUseImageCropToolbarResult = {
  isVisible: boolean;
  onZoomChange: TFunc<[number]>;
  zoom: number;
};

export const useImageCropToolbar = (): TUseImageCropToolbarResult => {
  const imageEditor = useAppSelector(selectImageEditor);
  const [zoom, setZoom] = useState(ZOOM_SLIDER_DEFAULT);

  return { isVisible: imageEditor?.mode === 'crop', onZoomChange: setZoom, zoom };
};
