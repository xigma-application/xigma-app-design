import cx from 'classnames';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

// @xigma
import { Icon, TIconProps } from '@xigma/components';

// styles
import styles from './button-icon.module.scss';

export type TButtonIconProps = {
  active?: boolean;
  ariaLabel?: string;
  className?: string;
  color?: TIconProps['color'];
  disabled?: boolean;
  endAdornment?: ReactNode;
  name: TIconProps['name'];
  onClick?: TFunc;
  selected?: boolean;
  size?: TIconProps['size'];
  startAdornment?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className' | 'disabled' | 'name' | 'onClick' | 'type'>;

export const ButtonIcon = forwardRef<HTMLButtonElement, TButtonIconProps>(
  (
    {
      active,
      ariaLabel,
      className = '',
      color,
      disabled = false,
      endAdornment,
      name,
      onClick,
      selected = false,
      size = 24,
      startAdornment,
      ...rest
    },
    ref,
  ) => (
    <button
      {...rest}
      aria-label={ariaLabel}
      aria-pressed={active || selected}
      className={cx(
        styles.ButtonIcon,
        {
          [styles['ButtonIcon--active']]: active,
          [styles['ButtonIcon--disabled']]: disabled,
          [styles['ButtonIcon--with-adornment']]: startAdornment || endAdornment,
          [styles['ButtonIcon--selected']]: selected,
        },
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type="button"
    >
      {startAdornment && <span className={styles.ButtonIcon__adornment}>{startAdornment}</span>}
      <Icon color={color} name={name} size={size} />
      {endAdornment && <span className={styles.ButtonIcon__adornment}>{endAdornment}</span>}
    </button>
  ),
);

ButtonIcon.displayName = 'ButtonIcon';

export default ButtonIcon;
