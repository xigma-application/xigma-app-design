import cx from 'classnames';
import { FC } from 'react';

// styles
import styles from './preview-auto-spacing.module.scss';

// types
import { TAutoSpacing } from '../../types';
import { AutoSpacing } from 'types/design/enums';

export type TPreviewAutoSpacingProps = {
  value: TAutoSpacing;
};

const BOX_INDEXES = [0, 1, 2];

export const PreviewAutoSpacing: FC<TPreviewAutoSpacingProps> = ({ value }) => (
  <div className={cx(styles.PreviewAutoSpacing, { [styles[`PreviewAutoSpacing--${value}`]]: value !== AutoSpacing.between })}>
    {BOX_INDEXES.map((index) => (
      <div className={styles['PreviewAutoSpacing__box-wrapper']} key={index}>
        <div className={styles.PreviewAutoSpacing__box} />
      </div>
    ))}
  </div>
);

export default PreviewAutoSpacing;
