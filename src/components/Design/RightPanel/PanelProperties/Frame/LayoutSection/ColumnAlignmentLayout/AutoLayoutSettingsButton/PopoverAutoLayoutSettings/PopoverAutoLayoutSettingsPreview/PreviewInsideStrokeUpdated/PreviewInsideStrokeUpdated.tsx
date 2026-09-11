import cx from 'classnames';
import { FC } from 'react';

// styles
import styles from './preview-inside-stroke-updated.module.scss';

// types
import { TInsideStroke } from '../../types';
import { InsideStroke } from 'types/design/enums';

export type TPreviewInsideStrokeUpdatedProps = {
  value: TInsideStroke;
};

export const PreviewInsideStrokeUpdated: FC<TPreviewInsideStrokeUpdatedProps> = ({ value }) => {
  const excluded = value === InsideStroke.excluded;

  return (
    <div className={styles.PreviewInsideStrokeUpdated}>
      <div className={styles.PreviewInsideStrokeUpdated__tile}>
        <div className={styles.PreviewInsideStrokeUpdated__content} />
      </div>
      <div
        className={cx(styles.PreviewInsideStrokeUpdated__stroke, { [styles['PreviewInsideStrokeUpdated__stroke--excluded']]: excluded })}
      />
    </div>
  );
};

export default PreviewInsideStrokeUpdated;
