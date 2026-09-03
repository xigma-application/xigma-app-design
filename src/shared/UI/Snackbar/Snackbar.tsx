import cx from 'classnames';
import { FC, ReactNode } from 'react';

// hooks
import { useSnackbarAutoHide } from './hooks/useSnackbarAutoHide';

// styles
import styles from './snackbar.module.scss';

export type TSnackbarProps = {
  autoHideAfterMs?: number;
  children: ReactNode;
  className?: string;
  onAutoHide?: () => void;
};

export const Snackbar: FC<TSnackbarProps> = ({ autoHideAfterMs, children, className = '', onAutoHide }) => {
  useSnackbarAutoHide(autoHideAfterMs, onAutoHide);

  return <div className={cx(styles.Snackbar, className)}>{children}</div>;
};

export default Snackbar;
