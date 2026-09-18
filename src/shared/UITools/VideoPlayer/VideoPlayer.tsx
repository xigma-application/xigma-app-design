import cx from 'classnames';
import { FC } from 'react';

// components
import ButtonIcon from '../ButtonIcon/ButtonIcon';
import Slider from '../Slider/Slider';

// styles
import styles from './video-player.module.scss';

// utils
import { formatElapsedTime } from './utils/formatElapsedTime';

export type TVideoPlayerProps = {
  className?: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: TFunc<[number]>;
  onSeekEnd?: TFunc;
  onSeekStart?: TFunc;
  onTogglePlay: TFunc;
  pauseAriaLabel?: string;
  playAriaLabel?: string;
  seekAriaLabel?: string;
};

export const VideoPlayer: FC<TVideoPlayerProps> = ({
  className,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onSeekEnd,
  onSeekStart,
  onTogglePlay,
  pauseAriaLabel = 'Pause',
  playAriaLabel = 'Play',
  seekAriaLabel = 'Seek',
}) => (
  <div className={cx(styles.VideoPlayer, className)}>
    <ButtonIcon
      ariaLabel={isPlaying ? pauseAriaLabel : playAriaLabel}
      name={isPlaying ? 'Pause' : 'Play'}
      onClick={onTogglePlay}
      size={16}
    />
    <Slider
      ariaLabel={seekAriaLabel}
      className={styles.VideoPlayer__slider}
      max={duration || 1}
      min={0}
      onChange={onSeek}
      onDragEnd={onSeekEnd}
      onDragStart={onSeekStart}
      value={Math.min(currentTime, duration || 1)}
      variant="video"
    />
    <span className={styles.VideoPlayer__timer}>{formatElapsedTime(currentTime)}</span>
  </div>
);

export default VideoPlayer;
