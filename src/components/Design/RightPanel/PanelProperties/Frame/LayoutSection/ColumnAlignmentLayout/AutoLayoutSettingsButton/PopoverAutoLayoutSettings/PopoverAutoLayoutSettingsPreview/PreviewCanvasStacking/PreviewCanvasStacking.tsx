import cx from 'classnames';
import { FC } from 'react';

// styles
import styles from './preview-canvas-stacking.module.scss';

// types
import { TCanvasStacking } from '../../types';

export type TPreviewCanvasStackingProps = {
  value: TCanvasStacking;
};

const CIRCLE_VALUES = [1, 2, 3];

export const PreviewCanvasStacking: FC<TPreviewCanvasStackingProps> = ({ value }) => {
  const firstOnTop = value === 'firstOnTop';

  return (
    <div className={cx(styles.PreviewCanvasStacking, { [styles['PreviewCanvasStacking--first-on-top']]: firstOnTop })}>
      {CIRCLE_VALUES.map((circleValue) => (
        <div className={styles.PreviewCanvasStacking__circle} key={circleValue}>
          {circleValue}
        </div>
      ))}
    </div>
  );
};

export default PreviewCanvasStacking;
