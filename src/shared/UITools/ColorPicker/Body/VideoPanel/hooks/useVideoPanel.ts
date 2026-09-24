import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

// others
import { DEFAULT_VIDEO_PANEL_STATE, translationNameSpace } from '../constants';

// store
import { setDesignHintLabelKey } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TImageFillMode } from '../../ImagePanel/types';
import { TVideoPanelState } from '../types';

// utils
import { getFileExtension } from '../utils/getFileExtension';
import { getFileObjectUrl } from 'utils/media/getFileObjectUrl';
import { getFileVideoFrame } from 'utils/media/getFileVideoFrame';
import { isSupportedVideoFile } from '../utils/isSupportedVideoFile';
import { videoSrcUrlCache } from '../utils/videoSrcUrlCache';

export type TUseVideoPanelResult = TVideoPanelState & {
  setFillMode: TFunc<[TImageFillMode]>;
  setVideo: TFunc<[File]>;
};

export const useVideoPanel = (initialVideoUrl?: string, initialFillMode?: TImageFillMode): TUseVideoPanelResult => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState<TVideoPanelState>({
    ...DEFAULT_VIDEO_PANEL_STATE,
    fillMode: initialFillMode ?? DEFAULT_VIDEO_PANEL_STATE.fillMode,
    videoSrcUrl: (initialVideoUrl && videoSrcUrlCache.get(initialVideoUrl)) ?? DEFAULT_VIDEO_PANEL_STATE.videoSrcUrl,
    videoUrl: initialVideoUrl ?? DEFAULT_VIDEO_PANEL_STATE.videoUrl,
  });

  const setVideo = (file: File): void => {
    if (isSupportedVideoFile(file)) {
      void getFileObjectUrl(file).then((videoSrcUrl) => {
        setState((previous) => ({ ...previous, videoSrcUrl }));

        void getFileVideoFrame(file, ({ src }) => {
          videoSrcUrlCache.set(src, videoSrcUrl);
          setState((previous) => ({ ...previous, videoUrl: src }));
        });
      });
    } else {
      dispatch(setDesignHintLabelKey(t(`${translationNameSpace}.unsupportedFileTypeError`, { extension: getFileExtension(file.name) })));
    }
  };

  const setFillMode = useCallback<TFunc<[TImageFillMode]>>((fillMode) => setState((previous) => ({ ...previous, fillMode })), []);

  return {
    ...state,
    setFillMode,
    setVideo,
  };
};
