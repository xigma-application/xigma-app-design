import { FC } from 'react';

// hooks
import { usePointerDrag } from '../../../hooks/usePointerDrag';

// others
import { SLIDER_THUMB_RADIUS } from '../../../constants';

// styles
import styles from './alpha-slider.module.scss';

// utils
import { getThumbOffset } from '../../../utils/getThumbOffset';

export type TAlphaSliderProps = { alpha: number; color: string; onChange: TFunc<[number]> };

export const AlphaSlider: FC<TAlphaSliderProps> = ({ alpha, color, onChange }) => {
  const { onPointerDown, onPointerMove, onPointerUp, trackRef } = usePointerDrag({
    onChange: ({ x }) => onChange(x * 100),
  });

  return (
    <div
      className={styles.AlphaSlider}
      data-no-drag
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={trackRef}
    >
      <div className={styles.AlphaSlider__gradient} style={{ backgroundImage: `linear-gradient(to right, transparent, ${color})` }} />
      <div className={styles.AlphaSlider__thumb} style={{ left: getThumbOffset(alpha / 100, SLIDER_THUMB_RADIUS) }} />
    </div>
  );
};

export default AlphaSlider;
