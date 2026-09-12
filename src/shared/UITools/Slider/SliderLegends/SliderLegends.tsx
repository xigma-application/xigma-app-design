import { FC } from 'react';

// styles
import styles from './slider-legends.module.scss';

// types
import { TSliderMark } from '../types';

// utils
import { getMarkOffset } from '../utils/getMarkOffset';

export type TSliderLegendsProps = {
  marks: TSliderMark[];
  max: number;
  min: number;
};

export const SliderLegends: FC<TSliderLegendsProps> = ({ marks, max, min }) => (
  <div className={styles.SliderLegends}>
    {marks.map((mark) => (
      <span className={styles.SliderLegends__legend} key={mark.value} style={{ left: getMarkOffset(mark.value, min, max) }}>
        {mark.label}
      </span>
    ))}
  </div>
);

export default SliderLegends;
