import cx from 'classnames';
import { FC } from 'react';

// styles
import styles from './preview-align-text-baseline.module.scss';

// types
import { TAlignTextBaseline } from '../../types';
import { AlignTextBaseline } from 'types/design/enums';

export type TPreviewAlignTextBaselineProps = {
  value: TAlignTextBaseline;
};

export const PreviewAlignTextBaseline: FC<TPreviewAlignTextBaselineProps> = ({ value }) => {
  const on = value === AlignTextBaseline.on;

  return (
    <div className={cx(styles.PreviewAlignTextBaseline, { [styles['PreviewAlignTextBaseline--on']]: on })}>
      <div className={styles.PreviewAlignTextBaseline__line} />
      <div className={styles['PreviewAlignTextBaseline__box-start']}>A</div>
      <div className={styles['PreviewAlignTextBaseline__box-middle']} />
      <div className={styles['PreviewAlignTextBaseline__box-end']}>g</div>
    </div>
  );
};

export default PreviewAlignTextBaseline;
