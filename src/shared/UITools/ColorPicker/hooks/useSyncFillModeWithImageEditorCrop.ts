import { useEffect } from 'react';

// store
import { selectImageEditor } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TImageFillMode } from '../Body/ImagePanel/types';

export const useSyncFillModeWithImageEditorCrop = (isImageTabActive: boolean, setFillMode: TFunc<[TImageFillMode]>): void => {
  const imageEditor = useAppSelector(selectImageEditor);

  useEffect(() => {
    if (isImageTabActive && imageEditor?.mode === 'crop') {
      setFillMode('crop');
    }
  }, [imageEditor?.mode, isImageTabActive, setFillMode]);
};
