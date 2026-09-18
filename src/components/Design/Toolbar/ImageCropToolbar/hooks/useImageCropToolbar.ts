// store
import { selectImageEditor } from 'store/design/selectors';
import { useAppSelector } from 'store';

// hooks
import { useHandleZoomChange } from './useHandleZoomChange';

// utils
import { getImageCropZoomPercent } from '../utils/getImageCropZoomPercent';
import { selectImageCropTarget } from '../utils/selectImageCropTarget';

export type TUseImageCropToolbarResult = {
  isVisible: boolean;
  onZoomChange: TFunc<[number]>;
  zoom: number;
};

export const useImageCropToolbar = (): TUseImageCropToolbarResult => {
  const imageEditor = useAppSelector(selectImageEditor);
  const target = useAppSelector(selectImageCropTarget);
  const onZoomChange = useHandleZoomChange(target?.node, target?.paint, target?.paintIndex);

  return {
    isVisible: imageEditor?.mode === 'crop',
    onZoomChange,
    zoom: target ? getImageCropZoomPercent(target.node, target.paint) : 0,
  };
};
