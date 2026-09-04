import cx from 'classnames';
import { FC, ReactNode } from 'react';
import { size } from 'lodash';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';
import SectionColumnButtonIcons from './SectionColumnButtonIcons/SectionColumnButtonIcons';
import SectionColumnContent from './SectionColumnContent/SectionColumnContent';
import SectionColumnLabels from './SectionColumnLabels/SectionColumnLabels';

// styles
import styles from './section-column.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { GridColumnType } from './enums';

export type TSectionColumnProps = {
  buttonsIcon?: ReactNode[];
  children: ReactNode;
  gridColumnType?: GridColumnType;
  labels?: [string] | [string, string];
  withBottomMargin?: boolean;
  withInputConnector?: boolean;
  withTopMargin?: boolean;
};

export const SectionColumn: FC<TSectionColumnProps> = ({
  buttonsIcon,
  children,
  gridColumnType,
  labels,
  withBottomMargin = false,
  withInputConnector = false,
  withTopMargin = false,
}) => {
  const buttonsWidthTotal = (size(buttonsIcon) || 1) * 24;
  const additionalGap = size(buttonsIcon) === 2 ? 2.5 : 0;
  const width = `calc(100% - ${buttonsWidthTotal}px - ${additionalGap}px - 8px)`;

  return (
    <E2EDataAttribute type={E2EAttribute.section} value="">
      <div
        className={cx(styles.SectionColumn, {
          [styles['SectionColumn--with-bottom-margin']]: withBottomMargin,
          [styles['SectionColumn--with-top-margin']]: withTopMargin,
        })}
      >
        <SectionColumnLabels labels={labels} width={width} />
        <div className={styles.SectionColumn__row}>
          <SectionColumnContent gridColumnType={gridColumnType} width={width} withInputConnector={withInputConnector}>
            {children}
          </SectionColumnContent>
          <SectionColumnButtonIcons buttonsIcon={buttonsIcon} />
        </div>
      </div>
    </E2EDataAttribute>
  );
};

export default SectionColumn;
