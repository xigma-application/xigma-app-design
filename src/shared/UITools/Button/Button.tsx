import cx from 'classnames';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

// styles
import styles from './button.module.scss';

export type TButtonColor = 'primary' | 'secondary';

export type TButtonSize = 'large' | 'medium' | 'small';

export type TButtonVariant = 'outline' | 'solid';

export type TButtonProps = {
  active?: boolean;
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  color?: TButtonColor;
  disabled?: boolean;
  onClick?: TFunc;
  selected?: boolean;
  size?: TButtonSize;
  variant?: TButtonVariant;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className' | 'disabled' | 'onClick' | 'type'>;

export const Button = forwardRef<HTMLButtonElement, TButtonProps>(
  (
    {
      active = false,
      ariaLabel,
      children,
      className = '',
      color = 'primary',
      disabled = false,
      onClick,
      selected = false,
      size = 'medium',
      variant = 'solid',
      ...rest
    },
    ref,
  ) => (
    <button
      {...rest}
      aria-label={ariaLabel}
      aria-pressed={active || selected}
      className={cx(
        styles.Button,
        {
          [styles['Button--active']]: active,
          [styles['Button--disabled']]: disabled,
          [styles['Button--large']]: size === 'large',
          [styles['Button--outline']]: variant === 'outline',
          [styles['Button--secondary']]: color === 'secondary',
          [styles['Button--selected']]: selected,
          [styles['Button--small']]: size === 'small',
        },
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';

export default Button;
