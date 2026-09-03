import cx from 'classnames';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

// styles
import styles from './button.module.scss';

export type TButtonVariant = 'outline' | 'solid';

export type TButtonProps = {
  active?: boolean;
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: TFunc;
  variant?: TButtonVariant;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className' | 'disabled' | 'onClick' | 'type'>;

export const Button = forwardRef<HTMLButtonElement, TButtonProps>(
  ({ active = false, ariaLabel, children, className = '', disabled = false, onClick, variant = 'solid', ...rest }, ref) => (
    <button
      {...rest}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cx(
        styles.Button,
        { [styles['Button--active']]: active, [styles['Button--disabled']]: disabled, [styles['Button--outline']]: variant === 'outline' },
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
