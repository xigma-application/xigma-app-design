import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ImageFillModeRow from '../ImagePanel/ImageFillModeRow/ImageFillModeRow';
import VideoSourcePreview from './VideoSourcePreview/VideoSourcePreview';
import { UITools } from 'shared';

// hooks
import { TUseVideoPanelResult } from './hooks/useVideoPanel';
import { useHandleFillModeChange } from '../ImagePanel/hooks/useHandleFillModeChange';
import { useVideoPlayer } from 'shared/UITools/VideoPlayer/hooks/useVideoPlayer';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './video-panel.module.scss';

// types
import { TImageFillMode } from '../ImagePanel/types';

export type TVideoPanelProps = {
  disabledFillModes?: TImageFillMode[];
  onRotate?: TFunc;
  onScaleModeChange?: TFunc<[TImageFillMode]>;
  onTileScaleChange?: TFunc<[number]>;
  tileScale?: number;
  videoPanel: TUseVideoPanelResult;
};

export const VideoPanel: FC<TVideoPanelProps> = ({
  disabledFillModes,
  onRotate,
  onScaleModeChange,
  onTileScaleChange,
  tileScale,
  videoPanel,
}) => {
  const { t } = useTranslation();
  const handleFillModeChange = useHandleFillModeChange(videoPanel.setFillMode, onScaleModeChange);
  const player = useVideoPlayer();

  return (
    <div className={styles.VideoPanel}>
      <ImageFillModeRow
        disabledFillModes={disabledFillModes}
        fillMode={videoPanel.fillMode}
        onRotate={onRotate}
        onTileScaleChange={onTileScaleChange}
        setFillMode={handleFillModeChange}
        tileScale={tileScale}
      />
      <VideoSourcePreview videoPanel={videoPanel} videoRef={player.videoRef} />
      {videoPanel.videoSrcUrl && (
        <UITools.VideoPlayer
          currentTime={player.currentTime}
          duration={player.duration}
          isPlaying={player.isPlaying}
          onSeek={player.onSeek}
          onSeekEnd={player.onSeekEnd}
          onSeekStart={player.onSeekStart}
          onTogglePlay={player.onTogglePlay}
          pauseAriaLabel={t(`${translationNameSpace}.pauseAriaLabel`)}
          playAriaLabel={t(`${translationNameSpace}.playAriaLabel`)}
          seekAriaLabel={t(`${translationNameSpace}.seekAriaLabel`)}
        />
      )}
    </div>
  );
};

export default VideoPanel;
