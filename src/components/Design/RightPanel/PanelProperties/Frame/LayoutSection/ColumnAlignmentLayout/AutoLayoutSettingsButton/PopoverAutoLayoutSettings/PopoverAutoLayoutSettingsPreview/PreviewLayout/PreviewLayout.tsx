import cx from 'classnames';
import { FC } from 'react';

// styles
import styles from './preview-layout.module.scss';

// types
import { LayoutVersion } from 'types/design/enums';
import { TLayoutVersion } from '../../types';

export type TPreviewLayoutProps = {
  value: TLayoutVersion;
};

export const PreviewLayout: FC<TPreviewLayoutProps> = ({ value }) => {
  const legacy = value === LayoutVersion.legacy;

  return (
    <div className={cx(styles.PreviewLayout, { [styles['PreviewLayout--legacy']]: legacy })}>
      <div className={styles['PreviewLayout__box-left']}>
        <div className={styles['PreviewLayout__box-left-inner']} />
      </div>
      <div className={styles['PreviewLayout__box-right']} />
    </div>
  );
};

export default PreviewLayout;
