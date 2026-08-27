import cx from 'classnames';
import { FC } from 'react';

// others
import { SAMPLE_GRID_MIDDLE_INDEX } from '../constants';

// styles
import styles from './color-result.module.scss';

// types
import { TRgba } from 'types/color';

// utils
import { rgbToHex } from 'utils/color/rgbToHex';

export type TColorResultProps = { colors: TRgba[] };

export const ColorResult: FC<TColorResultProps> = ({ colors }) => {
  const { a, b, g, r } = colors[SAMPLE_GRID_MIDDLE_INDEX] ?? { a: 0, b: 0, g: 0, r: 0 };

  return (
    <div className={cx(styles.ColorResult)}>
      <div className={styles['ColorResult__selected-color']} style={{ backgroundColor: `rgba(${r},${g},${b},${a})` }} />
      <span className={styles.ColorResult__hex}>{rgbToHex({ b, g, r })}</span>
    </div>
  );
};

export default ColorResult;
