import cx from 'classnames';
import { FC, useMemo } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// @xigma
import { Icon, TIconProps } from '@xigma/components';

// components
import CheckboxIndicator from '../../../UI/Checkbox/CheckboxIndicator/CheckboxIndicator';

// styles
import styles from './popover-item.module.scss';

export type TPopoverItemProps = {
  checkIconSize?: number;
  checkVariant?: 'check' | 'checkbox';
  className?: string;
  disabled?: boolean;
  icon?: TIconProps['name'];
  iconSize?: number;
  label: string;
  maxWidth?: number;
  onClick?: () => void;
  selected?: boolean;
  shortcut?: string;
  shortcutClassName?: string;
  withCheck?: boolean;
};

export const PopoverItem: FC<TPopoverItemProps> = ({
  checkIconSize = 14,
  checkVariant = 'check',
  className = '',
  disabled = false,
  icon,
  iconSize = 14,
  label,
  maxWidth,
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
        {withCheck && checkVariant === 'checkbox' && <CheckboxIndicator value={selected} />}
        {withCheck && checkVariant === 'check' && (
          <span style={{ opacity: selected ? 1 : 0 }}>
            <Icon name="Check" size={checkIconSize} />
          </span>
        )}
        {withCheck && icon && <Icon name={icon} size={iconSize} />}
        {!withCheck && (
          <span className={styles.PopoverItem__iconSlot} style={{ width: iconSize }}>
            {icon && <Icon name={icon} size={iconSize} />}
          </span>
        )}
        <div className={styles.PopoverItem__row} style={maxWidth ? { maxWidth } : undefined}>
          <span className={styles.PopoverItem__label}>{label}</span>
          {shortcut && <span className={cx(styles.PopoverItem__shortcut, shortcutClassName)}>{shortcut}</span>}
        </div>
      </div>
    ),
    [
      checkIconSize,
      checkVariant,
      className,
      disabled,
      icon,
      iconSize,
      label,
      maxWidth,
      onClick,
      selected,
      shortcut,
      shortcutClassName,
      withCheck,
    ],
  );

  return disabled ? content : <PopoverPrimitive.Close asChild>{content}</PopoverPrimitive.Close>;
};

export default PopoverItem;
