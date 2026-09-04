import cx from 'classnames';
import { FC, ReactNode } from 'react';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from './component-header.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TComponentHeaderProps = {
  buttons?: ReactNode;
  children: ReactNode;
  e2eValue?: TE2EValue;
};

export const ComponentHeader: FC<TComponentHeaderProps> = ({ buttons, children, e2eValue = '' }) => (
  <E2EDataAttribute type={E2EAttribute.componentHeader} value={e2eValue}>
    <div className={cx(styles.ComponentHeader)}>
      <div className={styles.ComponentHeader__label}>{children}</div>
      {buttons && <div className={styles.ComponentHeader__buttons}>{buttons}</div>}
    </div>
  </E2EDataAttribute>
);

export default ComponentHeader;
