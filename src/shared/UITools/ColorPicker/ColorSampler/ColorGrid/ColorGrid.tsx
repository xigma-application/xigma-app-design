import cx from 'classnames';
import { FC } from 'react';

// styles
import styles from './color-grid.module.scss';

// types
import { TRgba } from 'types/color';

export type TColorGridProps = { colors: TRgba[] };

export const ColorGrid: FC<TColorGridProps> = ({ colors }) => (
  <div className={cx(styles.ColorGrid)}>
    <div className={styles['ColorGrid__color-grid']}>
      {colors.map(({ a, b, g, r }, index) => (
        <div className={styles['ColorGrid__picker-grid']} key={index} style={{ backgroundColor: `rgba(${r},${g},${b},${a})` }} />
      ))}
    </div>
    <div className={styles['ColorGrid__picker-target-color']} />
  </div>
);

export default ColorGrid;
