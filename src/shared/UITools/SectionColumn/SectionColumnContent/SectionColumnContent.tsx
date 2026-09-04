import cx from 'classnames';
import { FC, ReactNode } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// others
import { SECTION_COLUMN_CONTENT_MODIFIERS } from './constants';

// styles
import styles from './section-column-content.module.scss';

// types
import { GridColumnType } from '../enums';

export type TSectionColumnContentProps = {
  children: ReactNode;
  gridColumnType?: GridColumnType;
  width: string;
  withInputConnector?: boolean;
};

export const SectionColumnContent: FC<TSectionColumnContentProps> = ({
  children,
  gridColumnType = GridColumnType.single,
  width,
  withInputConnector = false,
}) => (
  <div className={cx(styles.SectionColumnContent, styles[SECTION_COLUMN_CONTENT_MODIFIERS[gridColumnType]])} style={{ width }}>
    {children}
    {withInputConnector && (
      <div className={styles['SectionColumnContent__input-connector']}>
        <Icon color="surface" name="InputsConnector" size={24} />
      </div>
    )}
  </div>
);

export default SectionColumnContent;
