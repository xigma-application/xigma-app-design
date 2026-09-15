import cx from 'classnames';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

// @xigma
import { Icon, TIconProps } from '@xigma/components';

// styles
import styles from './button-icon.module.scss';

export type TButtonIconProps = {
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  name: TIconProps['name'];
  onClick?: TFunc;
  selected?: boolean;
  size?: TIconProps['size'];
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className' | 'disabled' | 'name' | 'onClick' | 'type'>;

export const ButtonIcon = forwardRef<HTMLButtonElement, TButtonIconProps>(
  ({ ariaLabel, className = '', disabled = false, name, onClick, selected = false, size = 24, ...rest }, ref) => (
    <button
      {...rest}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={cx(
        styles.ButtonIcon,
        {
          [styles['ButtonIcon--disabled']]: disabled,
          [styles['ButtonIcon--selected']]: selected,
        },
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type="button"
    >
      <Icon name={name} size={size} />
    </button>
  ),
);

ButtonIcon.displayName = 'ButtonIcon';

export default ButtonIcon;
