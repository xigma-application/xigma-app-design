import cx from 'classnames';
import { FC, ReactNode } from 'react';

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
};

export const SectionColumnContent: FC<TSectionColumnContentProps> = ({ children, gridColumnType = GridColumnType.single, width }) => (
  <div className={cx(styles.SectionColumnContent, styles[SECTION_COLUMN_CONTENT_MODIFIERS[gridColumnType]])} style={{ width }}>
    {children}
  </div>
);

export default SectionColumnContent;
