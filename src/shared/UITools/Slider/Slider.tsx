import cx from 'classnames';
import { FC } from 'react';

// components
import SliderLegends from './SliderLegends/SliderLegends';
import SliderTrack from './SliderTrack/SliderTrack';

// hooks
import { useSliderDrag } from './hooks/useSliderDrag';

// styles
import styles from './slider.module.scss';

// types
import { TSliderMark } from './types';

export type { TSliderMark } from './types';

export type TSliderProps = {
  ariaLabel?: string;
  className?: string;
  marks?: TSliderMark[];
  max: number;
  min: number;
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  value: number;
};

export const Slider: FC<TSliderProps> = ({ ariaLabel, className, marks = [], max, min, onChange, onDragEnd, onDragStart, value }) => {
  const { onPointerDown, onPointerMove, onPointerUp, trackRef } = useSliderDrag({ max, min, onChange, onDragEnd, onDragStart });

  return (
    <div className={cx(styles.Slider, className)}>
      <SliderTrack
        ariaLabel={ariaLabel}
        marks={marks}
        max={max}
        min={min}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        trackRef={trackRef}
        value={value}
      />
      {marks.some((mark) => mark.label) && <SliderLegends marks={marks} max={max} min={min} />}
    </div>
  );
};

export default Slider;
