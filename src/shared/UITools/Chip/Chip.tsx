import cx from 'classnames';
import { FC, ReactNode } from 'react';

// styles
import styles from './chip.module.scss';

export type TChipVariant = 'free' | 'secondary';

export type TChipProps = {
  children: ReactNode;
  className?: string;
  onClick?: TFunc;
  variant?: TChipVariant;
};

export const Chip: FC<TChipProps> = ({ children, className = '', onClick, variant = 'free' }) => {
  const classes = cx(styles.Chip, styles[`Chip--${variant}`], { [styles['Chip--interactive']]: Boolean(onClick) }, className);

  if (onClick) {
    return (
      <button className={classes} onClick={onClick} type="button">
        {children}
      </button>
    );
  }

  return <span className={classes}>{children}</span>;
};

export default Chip;
