import cx from 'classnames';
import { FC, ReactNode } from 'react';

// styles
import styles from './chip.module.scss';

export type TChipVariant = 'free';

export type TChipProps = {
  children: ReactNode;
  className?: string;
  variant?: TChipVariant;
};

export const Chip: FC<TChipProps> = ({ children, className = '', variant = 'free' }) => (
  <span className={cx(styles.Chip, styles[`Chip--${variant}`], className)}>{children}</span>
);

export default Chip;
