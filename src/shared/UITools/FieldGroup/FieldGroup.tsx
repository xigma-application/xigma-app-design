import cx from 'classnames';
import { FC, ReactNode } from 'react';

// styles
import styles from './field-group.module.scss';

export type TFieldGroupProps = { children: ReactNode; className?: string };

export const FieldGroup: FC<TFieldGroupProps> = ({ children, className = '' }) => (
  <div className={cx(styles.FieldGroup, className)}>{children}</div>
);

export default FieldGroup;
