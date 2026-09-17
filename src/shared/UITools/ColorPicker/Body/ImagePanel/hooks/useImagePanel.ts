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
  setContrast: TFunc<[number]>;
  setExposure: TFunc<[number]>;
  setFillMode: TFunc<[TImageFillMode]>;
  setHighlights: TFunc<[number]>;
  setImage: TFunc<[File]>;
  setSaturation: TFunc<[number]>;
  setShadows: TFunc<[number]>;
  setTemperature: TFunc<[number]>;
  setTint: TFunc<[number]>;
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
    setContrast: (contrast): void => setState((previous) => ({ ...previous, contrast })),
    setExposure: (exposure): void => setState((previous) => ({ ...previous, exposure })),
    setFillMode,
    setHighlights: (highlights): void => setState((previous) => ({ ...previous, highlights })),
    setImage,
    setSaturation: (saturation): void => setState((previous) => ({ ...previous, saturation })),
    setShadows: (shadows): void => setState((previous) => ({ ...previous, shadows })),
    setTemperature: (temperature): void => setState((previous) => ({ ...previous, temperature })),
    setTint: (tint): void => setState((previous) => ({ ...previous, tint })),
  };
};
