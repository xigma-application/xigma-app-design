import cx from 'classnames';
import { FC } from 'react';

// others
import { HORIZONTAL_TICKS, isHorizontalTickActive, isVerticalTickActive, VERTICAL_TICKS } from './constants';

// styles
import styles from './constraints-preview.module.scss';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TNodeAlignment } from 'types/design/types';

export type TConstraintsPreviewProps = {
  alignment: TNodeAlignment;
  setHorizontal: TFunc<[AlignmentHorizontal]>;
  setVertical: TFunc<[AlignmentVertical]>;
};

const ConstraintsPreview: FC<TConstraintsPreviewProps> = ({ alignment, setHorizontal, setVertical }) => {
  const isHorizontalCentered = alignment.horizontal === AlignmentHorizontal.center;
  const isVerticalCentered = alignment.vertical === AlignmentVertical.center;

  return (
    <div className={styles.ConstraintsPreview}>
      <div className={styles.ConstraintsPreview__box}>
        {VERTICAL_TICKS.map(({ modifier, value }) => {
          const active = isVerticalTickActive(alignment.vertical, value);

          return (
            <div
              className={cx(styles.ConstraintsPreview__tick, styles[`ConstraintsPreview__tick--${modifier}`], {
                [styles['ConstraintsPreview__tick--active']]: active,
              })}
              key={modifier}
              onClick={() => setVertical(value)}
            >
              <span
                className={cx(styles.ConstraintsPreview__tick__line, styles[`ConstraintsPreview__tick__line--${modifier}`], {
                  [styles['ConstraintsPreview__tick__line--active']]: active,
                })}
              />
            </div>
          );
        })}
        {HORIZONTAL_TICKS.map(({ modifier, value }) => {
          const active = isHorizontalTickActive(alignment.horizontal, value);

          return (
            <div
              className={cx(styles.ConstraintsPreview__tick, styles[`ConstraintsPreview__tick--${modifier}`], {
                [styles['ConstraintsPreview__tick--active']]: active,
              })}
              key={modifier}
              onClick={() => setHorizontal(value)}
            >
              <span
                className={cx(styles.ConstraintsPreview__tick__line, styles[`ConstraintsPreview__tick__line--${modifier}`], {
                  [styles['ConstraintsPreview__tick__line--active']]: active,
                })}
              />
            </div>
          );
        })}
        <div className={styles.ConstraintsPreview__node}>
          <div
            className={cx(styles.ConstraintsPreview__node__cross, {
              [styles['ConstraintsPreview__node__cross--active']]: isHorizontalCentered,
              [styles['ConstraintsPreview__node__cross--locked']]: isHorizontalCentered,
            })}
            onClick={() => setHorizontal(AlignmentHorizontal.center)}
          >
            <span
              className={cx(styles.ConstraintsPreview__node__cross__line, styles['ConstraintsPreview__node__cross__line--horizontal'], {
                [styles['ConstraintsPreview__node__cross__line--active']]: isHorizontalCentered,
              })}
            />
          </div>
          <div
            className={cx(styles.ConstraintsPreview__node__cross, {
              [styles['ConstraintsPreview__node__cross--active']]: isVerticalCentered,
              [styles['ConstraintsPreview__node__cross--locked']]: !isHorizontalCentered,
            })}
            onClick={() => setVertical(AlignmentVertical.center)}
          >
            <span
              className={cx(styles.ConstraintsPreview__node__cross__line, styles['ConstraintsPreview__node__cross__line--vertical'], {
                [styles['ConstraintsPreview__node__cross__line--active']]: isVerticalCentered,
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstraintsPreview;
