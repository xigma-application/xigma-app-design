import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

// others
import { DEFAULT_IMAGE_PANEL_STATE, translationNameSpace } from '../constants';

// store
import { setDesignHintLabelKey } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TImageFillMode, TImagePanelState } from '../types';

// utils
import { getFileExtension } from '../utils/getFileExtension';
import { isSupportedImageFile } from '../utils/isSupportedImageFile';

export type TUseImagePanelResult = TImagePanelState & {
  setFillMode: TFunc<[TImageFillMode]>;
  setImage: TFunc<[File]>;
};

export const useImagePanel = (initialImageUrl?: string, initialFillMode?: TImageFillMode): TUseImagePanelResult => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState<TImagePanelState>({
    ...DEFAULT_IMAGE_PANEL_STATE,
    fillMode: initialFillMode ?? DEFAULT_IMAGE_PANEL_STATE.fillMode,
    imageUrl: initialImageUrl ?? DEFAULT_IMAGE_PANEL_STATE.imageUrl,
  });

  const setImage = (file: File): void => {
    if (isSupportedImageFile(file)) {
      setState((previous) => {
        if (previous.imageUrl) {
          URL.revokeObjectURL(previous.imageUrl);
        }

        return { ...previous, imageUrl: URL.createObjectURL(file) };
      });
    } else {
      dispatch(setDesignHintLabelKey(t(`${translationNameSpace}.unsupportedFileTypeError`, { extension: getFileExtension(file.name) })));
    }
  };

  const setFillMode = useCallback<TFunc<[TImageFillMode]>>((fillMode) => setState((previous) => ({ ...previous, fillMode })), []);

  return {
    ...state,
    setFillMode,
    setImage,
  };
};
