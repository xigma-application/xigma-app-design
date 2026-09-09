import cx from 'classnames';
import { FC } from 'react';

// styles
import styles from './preview-inside-stroke.module.scss';

// types
import { TInsideStroke } from '../../types';

export type TPreviewInsideStrokeProps = {
  value: TInsideStroke;
};

export const PreviewInsideStroke: FC<TPreviewInsideStrokeProps> = ({ value }) => {
  const excluded = value === 'excluded';

  return (
    <div className={cx(styles.PreviewInsideStroke, { [styles['PreviewInsideStroke--excluded']]: excluded })}>
      <div className={styles['PreviewInsideStroke__tile-left']}>
        <div className={styles['PreviewInsideStroke__tile-content']} />
      </div>
      <div className={styles['PreviewInsideStroke__tile-right']}>
        <div className={styles['PreviewInsideStroke__tile-content']} />
      </div>
      <div className={cx(styles.PreviewInsideStroke__stroke, { [styles['PreviewInsideStroke__stroke--excluded']]: excluded })} />
    </div>
  );
};

export default PreviewInsideStroke;
