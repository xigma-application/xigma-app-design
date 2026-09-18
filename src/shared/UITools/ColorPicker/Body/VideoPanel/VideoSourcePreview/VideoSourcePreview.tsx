import { CSSProperties, FC } from 'react';

// assets
import blankMediaUrl from 'assets/images/blank-media.png';

// components
import VideoSourceButtons from './VideoSourceButtons/VideoSourceButtons';

// hooks
import { TUseVideoPanelResult } from '../hooks/useVideoPanel';

// styles
import styles from './video-source-preview.module.scss';

export type TVideoSourcePreviewProps = { videoPanel: TUseVideoPanelResult };

export const VideoSourcePreview: FC<TVideoSourcePreviewProps> = ({ videoPanel }) => {
  const { setVideo, videoUrl } = videoPanel;
  const sourceButtons = <VideoSourceButtons onSelectFile={setVideo} />;

  return (
    <div
      className={styles.VideoSourcePreview}
      style={
        videoUrl
          ? ({
              backgroundImage: `url("${videoUrl}"), url("${blankMediaUrl}")`,
              backgroundPosition: 'center, center',
              backgroundRepeat: 'no-repeat, repeat',
              backgroundSize: 'contain, 208px 208px',
            } as CSSProperties)
          : undefined
      }
    >
      {videoUrl ? <div className={styles.VideoSourcePreview__overlay}>{sourceButtons}</div> : sourceButtons}
    </div>
  );
};

export default VideoSourcePreview;
