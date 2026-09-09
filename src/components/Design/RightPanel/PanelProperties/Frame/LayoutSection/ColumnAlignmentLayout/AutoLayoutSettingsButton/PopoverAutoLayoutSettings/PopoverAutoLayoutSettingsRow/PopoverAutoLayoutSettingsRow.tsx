import cx from 'classnames';
import { FC, ReactNode } from 'react';

// styles
import styles from './popover-auto-layout-settings-row.module.scss';

export type TPopoverAutoLayoutSettingsRowProps = {
  children: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  onMouseEnter?: TFunc;
  onMouseLeave?: TFunc;
};

export const PopoverAutoLayoutSettingsRow: FC<TPopoverAutoLayoutSettingsRowProps> = ({
  children,
  disabled = false,
  label,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    className={cx(styles.PopoverAutoLayoutSettingsRow, { [styles['PopoverAutoLayoutSettingsRow--disabled']]: disabled })}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <span className={styles.PopoverAutoLayoutSettingsRow__label}>{label}</span>
    <div className={styles.PopoverAutoLayoutSettingsRow__control}>{children}</div>
  </div>
);

export default PopoverAutoLayoutSettingsRow;
