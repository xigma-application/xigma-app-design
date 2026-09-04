import { FC } from 'react';

// hooks
import { usePointerDrag } from '../../../hooks/usePointerDrag';

// others
import { SLIDER_THUMB_RADIUS } from '../../../constants';

// styles
import styles from './hue-slider.module.scss';

// types
import { THsv } from '../../../types';

// utils
import { getThumbOffset } from '../../../utils/getThumbOffset';

export type THueSliderProps = {
  hue: THsv['h'];
  onChange: TFunc<[Partial<THsv>]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
};

export const HueSlider: FC<THueSliderProps> = ({ hue, onChange, onDragEnd, onDragStart }) => {
  const { onPointerDown, onPointerMove, onPointerUp, trackRef } = usePointerDrag({
    onChange: ({ x }) => onChange({ h: x * 360 }),
    onDragEnd,
    onDragStart,
  });

  return (
    <div
      className={styles.HueSlider}
      data-no-drag
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={trackRef}
    >
      <div className={styles.HueSlider__thumb} style={{ left: getThumbOffset(hue / 360, SLIDER_THUMB_RADIUS) }} />
    </div>
  );
};

export default HueSlider;
