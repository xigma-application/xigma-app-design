import cx from 'classnames';
import { FC, ReactNode } from 'react';

// styles
import styles from './snackbar.module.scss';

export type TSnackbarProps = {
  children: ReactNode;
  className?: string;
};

export const Snackbar: FC<TSnackbarProps> = ({ children, className = '' }) => (
  <div className={cx(styles.Snackbar, className)}>{children}</div>
);

export default Snackbar;
