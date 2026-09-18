import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, RefObject } from 'react';

// others
import { SLIDER_COMPACT_THUMB_RADIUS, SLIDER_THUMB_RADIUS, SLIDER_VIDEO_THUMB_RADIUS } from '../constants';

// styles
import styles from './slider-track.module.scss';

// types
import { TSliderMark, TSliderVariant } from '../types';

// utils
import { getMarkOffset } from '../utils/getMarkOffset';
import { getThumbOffset } from '../utils/getThumbOffset';

const THUMB_RADIUS_BY_VARIANT: Record<TSliderVariant, number> = {
  compact: SLIDER_COMPACT_THUMB_RADIUS,
  default: SLIDER_THUMB_RADIUS,
  video: SLIDER_VIDEO_THUMB_RADIUS,
};

export type TSliderTrackProps = {
  ariaLabel?: string;
  baseValue?: number;
  marks: TSliderMark[];
  max: number;
  min: number;
  onPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerMove: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerUp: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  trackRef: RefObject<HTMLDivElement | null>;
  value: number;
  variant?: TSliderVariant;
};

export const SliderTrack: FC<TSliderTrackProps> = ({
  ariaLabel,
  baseValue,
  marks,
  max,
  min,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  trackRef,
  value,
  variant = 'default',
}) => {
  const fraction = (value - min) / (max - min);
  const thumbOffset = getThumbOffset(fraction, THUMB_RADIUS_BY_VARIANT[variant]);
  const effectiveBaseValue = baseValue ?? min;
  const baseOffset = getMarkOffset(effectiveBaseValue, min, max);
  const hasValue = value !== effectiveBaseValue;
  const showsProgressFill = variant !== 'video';
  const fillStyle =
    effectiveBaseValue === min
      ? { width: thumbOffset }
      : value >= effectiveBaseValue
        ? { left: baseOffset, right: `calc(100% - ${thumbOffset})` }
        : { left: thumbOffset, right: `calc(100% - ${baseOffset})` };

  return (
    <div
      aria-label={ariaLabel}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={value}
      className={cx(styles.SliderTrack, {
        [styles['SliderTrack--compact']]: variant === 'compact',
        [styles['SliderTrack--video']]: variant === 'video',
      })}
      data-no-drag
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={trackRef}
      role="slider"
      tabIndex={0}
    >
      <div className={styles.SliderTrack__rail}>
        {showsProgressFill && <div className={styles.SliderTrack__fill} style={fillStyle} />}
        {effectiveBaseValue !== min && <div className={styles.SliderTrack__baseDot} style={{ left: baseOffset }} />}
        {marks.map((mark) => (
          <div className={styles.SliderTrack__mark} key={mark.value} style={{ left: getMarkOffset(mark.value, min, max) }} />
        ))}
      </div>
      <div
        className={cx(styles.SliderTrack__thumb, { [styles['SliderTrack__thumb--active']]: hasValue && showsProgressFill })}
        style={{ left: thumbOffset }}
      />
    </div>
  );
};

export default SliderTrack;
