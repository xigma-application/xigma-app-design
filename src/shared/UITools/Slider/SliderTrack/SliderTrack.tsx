import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, RefObject } from 'react';

// others
import { SLIDER_THUMB_RADIUS } from '../constants';

// styles
import styles from './slider-track.module.scss';

// types
import { TSliderMark } from '../types';

// utils
import { getMarkOffset } from '../utils/getMarkOffset';
import { getThumbOffset } from '../utils/getThumbOffset';

export type TSliderTrackProps = {
  ariaLabel?: string;
  marks: TSliderMark[];
  max: number;
  min: number;
  onPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerMove: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerUp: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  trackRef: RefObject<HTMLDivElement | null>;
  value: number;
};

export const SliderTrack: FC<TSliderTrackProps> = ({
  ariaLabel,
  marks,
  max,
  min,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  trackRef,
  value,
}) => {
  const fraction = (value - min) / (max - min);
  const thumbOffset = getThumbOffset(fraction, SLIDER_THUMB_RADIUS);
  const hasValue = value !== min;

  return (
    <div
      aria-label={ariaLabel}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={value}
      className={styles.SliderTrack}
      data-no-drag
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={trackRef}
      role="slider"
      tabIndex={0}
    >
      <div className={styles.SliderTrack__rail}>
        <div className={styles.SliderTrack__fill} style={{ width: thumbOffset }} />
        {marks.map((mark) => (
          <div className={styles.SliderTrack__mark} key={mark.value} style={{ left: getMarkOffset(mark.value, min, max) }} />
        ))}
      </div>
      <div className={cx(styles.SliderTrack__thumb, { [styles['SliderTrack__thumb--active']]: hasValue })} style={{ left: thumbOffset }} />
    </div>
  );
};

export default SliderTrack;
