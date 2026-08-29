import cx from 'classnames';
import { FC, useMemo } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// @xigma
import { Icon, TIconProps } from '@xigma/components';

// styles
import styles from './popover-item.module.scss';

export type TPopoverItemProps = {
  checkIconSize?: number;
  className?: string;
  disabled?: boolean;
  icon?: TIconProps['name'];
  iconSize?: number;
  label: string;
  onClick?: () => void;
  selected?: boolean;
  shortcut?: string;
  shortcutClassName?: string;
  withCheck?: boolean;
};

export const PopoverItem: FC<TPopoverItemProps> = ({
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
  withCheck = true,
}) => {
  const content = useMemo(
    () => (
      <div
        className={cx(styles.PopoverItem, disabled && styles['PopoverItem--disabled'], className)}
        onClick={disabled ? undefined : onClick}
      >
        {withCheck && (
          <span style={{ opacity: selected ? 1 : 0 }}>
            <Icon name="Check" size={checkIconSize} />
          </span>
        )}
        {icon && <Icon name={icon} size={iconSize} />}
        <span className={styles.PopoverItem__label}>{label}</span>
        {shortcut && <span className={cx(styles.PopoverItem__shortcut, shortcutClassName)}>{shortcut}</span>}
      </div>
    ),
    [checkIconSize, className, disabled, icon, iconSize, label, onClick, selected, shortcut, shortcutClassName, withCheck],
  );

  return disabled ? content : <PopoverPrimitive.Close asChild>{content}</PopoverPrimitive.Close>;
};

export default PopoverItem;
