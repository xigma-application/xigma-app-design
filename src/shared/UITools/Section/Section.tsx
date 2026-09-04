import cx from 'classnames';
import { FC, ReactElement, ReactNode } from 'react';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from './section.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TSectionProps = {
  children: ReactNode;
  component?: ReactElement;
  e2eValue?: TE2EValue;
  label?: string;
  separator?: boolean;
};

export const Section: FC<TSectionProps> = ({ children, component, e2eValue = '', label, separator = true }) => (
  <E2EDataAttribute type={E2EAttribute.section} value={e2eValue}>
    <div className={styles.Section}>
      {label && (
        <div className={cx(styles.Section__header, { [styles['Section__header--separator']]: separator })}>
          <span className={styles.Section__label}>{label}</span>
          {component && <div className={styles.Section__component}>{component}</div>}
        </div>
      )}
      {children}
    </div>
  </E2EDataAttribute>
);

export default Section;
