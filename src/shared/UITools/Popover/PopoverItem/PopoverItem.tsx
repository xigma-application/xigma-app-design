import cx from 'classnames';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC } from 'react';

// components
import { Icon, TIconProps } from 'shared/UI/Icon/Icon';

// styles
import styles from './popover-item.module.scss';

export type TPopoverItemProps = {
  checkIconSize?: number;
  className?: string;
  icon?: TIconProps['name'];
  iconSize?: number;
  label: string;
  onClick?: () => void;
  selected?: boolean;
  shortcut?: string;
  shortcutClassName?: string;
};

export const PopoverItem: FC<TPopoverItemProps> = ({
  checkIconSize = 14,
  className = '',
  icon,
  iconSize = 14,
  label,
  onClick,
  selected = false,
  shortcut,
  shortcutClassName = '',
}) => (
  <PopoverPrimitive.Close asChild>
    <div className={cx(styles.PopoverItem, className)} onClick={onClick}>
      <span style={{ opacity: selected ? 1 : 0 }}>
        <Icon name="Check" size={checkIconSize} />
      </span>
      {icon && <Icon name={icon} size={iconSize} />}
      <span className={styles.PopoverItem__label}>{label}</span>
      {shortcut && <span className={cx(styles.PopoverItem__shortcut, shortcutClassName)}>{shortcut}</span>}
    </div>
  </PopoverPrimitive.Close>
);

export default PopoverItem;
