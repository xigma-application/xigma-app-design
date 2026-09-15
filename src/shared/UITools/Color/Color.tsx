import cx from 'classnames';
import { CSSProperties, FC } from 'react';

// styles
import styles from './color.module.scss';

// utils
import { hexToRgb } from 'utils/color/hexToRgb';
import { rgbToCssString } from 'utils/color/rgbToCssString';

export type TColorProps = { alpha: number; className?: string; color: string; cursor?: 'default' | 'sampler'; dot?: boolean };

export const Color: FC<TColorProps> = ({ alpha, className = '', color, cursor = 'sampler', dot = false }) => {
  const rgb = hexToRgb(color);

  return (
    <div className={cx(styles.Color, { [styles['Color--cursor-default']]: cursor === 'default' }, className)}>
      <div className={styles.Color__wrapper}>
        {dot ? (
          <div className={styles.Color__dot} />
        ) : (
          <>
            <div className={styles.Color__picker} style={{ backgroundColor: rgbToCssString({ ...rgb, a: 100 }) }} />
            <div
              className={styles['Color__picker-alpha']}
              style={{ '--color-alpha-preview': rgbToCssString({ ...rgb, a: alpha }) } as CSSProperties}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Color;
