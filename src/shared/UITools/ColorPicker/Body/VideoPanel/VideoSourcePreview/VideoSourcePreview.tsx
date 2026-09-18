import { FC, RefObject } from 'react';

// components
import VideoSourceButtons from './VideoSourceButtons/VideoSourceButtons';

// hooks
import { TUseVideoPanelResult } from '../hooks/useVideoPanel';

// styles
import styles from './video-source-preview.module.scss';

export type TVideoSourcePreviewProps = { videoPanel: TUseVideoPanelResult; videoRef: RefObject<HTMLVideoElement | null> };

export const VideoSourcePreview: FC<TVideoSourcePreviewProps> = ({ videoPanel, videoRef }) => {
  const { setVideo, videoSrcUrl, videoUrl } = videoPanel;
  const sourceButtons = <VideoSourceButtons onSelectFile={setVideo} />;

  return (
    <div className={styles.VideoSourcePreview}>
      <video
        className={styles.VideoSourcePreview__video}
        hidden={!videoUrl}
        muted
        playsInline
        poster={videoUrl ?? undefined}
        ref={videoRef}
        src={videoSrcUrl ?? undefined}
      />
      {videoUrl ? <div className={styles.VideoSourcePreview__overlay}>{sourceButtons}</div> : sourceButtons}
    </div>
  );
};

export default VideoSourcePreview;
