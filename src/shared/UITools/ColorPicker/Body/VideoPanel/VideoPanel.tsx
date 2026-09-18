import { FC } from 'react';

// components
import ImageFillModeRow from '../ImagePanel/ImageFillModeRow/ImageFillModeRow';
import VideoSourcePreview from './VideoSourcePreview/VideoSourcePreview';

// hooks
import { TUseVideoPanelResult } from './hooks/useVideoPanel';
import { useHandleFillModeChange } from '../ImagePanel/hooks/useHandleFillModeChange';

// styles
import styles from './video-panel.module.scss';

// types
import { TImageFillMode } from '../ImagePanel/types';

export type TVideoPanelProps = {
  onRotate?: TFunc;
  onScaleModeChange?: TFunc<[TImageFillMode]>;
  onTileScaleChange?: TFunc<[number]>;
  tileScale?: number;
  videoPanel: TUseVideoPanelResult;
};

export const VideoPanel: FC<TVideoPanelProps> = ({ onRotate, onScaleModeChange, onTileScaleChange, tileScale, videoPanel }) => {
  const handleFillModeChange = useHandleFillModeChange(videoPanel.setFillMode, onScaleModeChange);

  return (
    <div className={styles.VideoPanel}>
      <ImageFillModeRow
        fillMode={videoPanel.fillMode}
        onRotate={onRotate}
        onTileScaleChange={onTileScaleChange}
        setFillMode={handleFillModeChange}
        tileScale={tileScale}
      />
      <VideoSourcePreview videoPanel={videoPanel} />
    </div>
  );
};

export default VideoPanel;
