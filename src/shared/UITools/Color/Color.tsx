import cx from 'classnames';
import { FC } from 'react';

// styles
import styles from './color.module.scss';

// utils
import { hexToRgb } from 'utils/color/hexToRgb';
import { rgbToCssString } from 'utils/color/rgbToCssString';

export type TColorProps = { alpha: number; className?: string; color: string };

export const Color: FC<TColorProps> = ({ alpha, className = '', color }) => {
  const rgb = hexToRgb(color);

  return (
    <div className={cx(styles.Color, className)}>
      <div className={styles.Color__picker} style={{ backgroundColor: rgbToCssString({ ...rgb, a: 100 }) }} />
      <div className={styles['Color__picker-alpha']} style={{ backgroundColor: rgbToCssString({ ...rgb, a: alpha }) }} />
      <div className={styles['Color__picker-texture']} />
    </div>
  );
};

export default Color;
