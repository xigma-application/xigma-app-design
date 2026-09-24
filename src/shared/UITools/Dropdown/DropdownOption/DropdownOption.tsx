import * as PopoverPrimitive from '@radix-ui/react-popover';
import cx from 'classnames';
import { FC, ReactNode } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// components
import { Icon } from 'shared';

// styles
import styles from './dropdown-option.module.scss';

export type TDropdownOptionProps = {
  content?: ReactNode;
  disabled?: boolean;
  highlighted: boolean;
  icon?: TIconProps['name'];
  iconSize?: number;
  label: string;
  onClick: TFunc;
  onMouseEnter: TFunc;
  selected: boolean;
};

export const DropdownOption: FC<TDropdownOptionProps> = ({
  content,
  disabled = false,
  highlighted,
  icon,
  iconSize = 12,
  label,
  onClick,
  onMouseEnter,
  selected,
}) => {
  const option = (
    <div
      aria-disabled={disabled || undefined}
      className={cx(styles.DropdownOption, {
        [styles['DropdownOption--disabled']]: disabled,
        [styles['DropdownOption--highlighted']]: highlighted && !disabled,
      })}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className={styles.DropdownOption__check} style={{ opacity: selected ? 1 : 0 }}>
        <Icon name="Check" size={12} />
      </span>
      {icon && (
        <span className={styles.DropdownOption__icon}>
          <Icon name={icon} size={iconSize} />
        </span>
      )}
      <span className={styles.DropdownOption__label}>{content ?? label}</span>
    </div>
  );

  return disabled ? option : <PopoverPrimitive.Close asChild>{option}</PopoverPrimitive.Close>;
};

export default DropdownOption;
