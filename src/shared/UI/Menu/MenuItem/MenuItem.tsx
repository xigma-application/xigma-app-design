import cx from 'classnames';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { FC } from 'react';

// @xigma
import { Icon, TIconProps } from '@xigma/components';

// styles
import styles from './menu-item.module.scss';

export type TMenuItemProps = {
  checkIconSize?: number;
  className?: string;
  disabled?: boolean;
  icon?: TIconProps['name'];
  iconSize?: number;
  label: string;
  onClick?: TFunc<[Event]>;
  selected?: boolean;
  shortcut?: string;
  shortcutClassName?: string;
};

export const MenuItem: FC<TMenuItemProps> = ({
  checkIconSize = 14,
  className = '',
  disabled = false,
  icon,
  iconSize = 14,
  label,
  onClick,
  selected = false,
  shortcut,
  shortcutClassName = '',
}) => (
  <DropdownMenuPrimitive.Item className={cx(styles.MenuItem, className)} disabled={disabled} onSelect={onClick}>
    <span style={{ opacity: selected ? 1 : 0 }}>
      <Icon name="Check" size={checkIconSize} />
    </span>
    {icon && <Icon name={icon} size={iconSize} />}
    <span className={styles.MenuItem__label}>{label}</span>
    {shortcut && <span className={cx(styles.MenuItem__shortcut, shortcutClassName)}>{shortcut}</span>}
  </DropdownMenuPrimitive.Item>
);

export default MenuItem;
