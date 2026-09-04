import cx from 'classnames';
import { FC, ReactNode } from 'react';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';
import SectionColumnContent from './SectionColumnContent/SectionColumnContent';
import SectionColumnLabels from './SectionColumnLabels/SectionColumnLabels';

// styles
import styles from './section-column.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { GridColumnType } from './enums';

export type TSectionColumnProps = {
  children: ReactNode;
  gridColumnType?: GridColumnType;
  labels?: [string] | [string, string];
  withBottomMargin?: boolean;
  withTopMargin?: boolean;
};

export const SectionColumn: FC<TSectionColumnProps> = ({
  children,
  gridColumnType,
  labels,
  withBottomMargin = false,
  withTopMargin = false,
}) => (
  <E2EDataAttribute type={E2EAttribute.section} value="">
    <div
      className={cx(styles.SectionColumn, {
        [styles['SectionColumn--with-bottom-margin']]: withBottomMargin,
        [styles['SectionColumn--with-top-margin']]: withTopMargin,
      })}
    >
      <SectionColumnLabels labels={labels} width="100%" />
      <div className={styles.SectionColumn__row}>
        <SectionColumnContent gridColumnType={gridColumnType} width="100%">
          {children}
        </SectionColumnContent>
      </div>
    </div>
  </E2EDataAttribute>
);

export default SectionColumn;
