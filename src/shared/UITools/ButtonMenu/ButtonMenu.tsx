import cx from 'classnames';
import { FC, ReactNode, useState } from 'react';

// components
import Popover, { TPopoverProps } from '../Popover/Popover';

// styles
import styles from './button-menu.module.scss';

export type TButtonMenuProps = Pick<TPopoverProps, 'align' | 'side' | 'sideOffset'> & {
  children?: ReactNode;
  className?: string;
  onOpenChange?: TFunc<[boolean]>;
  trigger: ReactNode | TFunc<[boolean], ReactNode>;
  triggerAriaLabel?: string;
};

export const ButtonMenu: FC<TButtonMenuProps> = ({
  align,
  children,
  className = '',
  onOpenChange,
  side,
  sideOffset,
  trigger,
  triggerAriaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <Popover
      align={align}
      onOpenChange={handleOpenChange}
      side={side}
      sideOffset={sideOffset}
      trigger={typeof trigger === 'function' ? trigger(isOpen) : trigger}
      triggerAriaLabel={triggerAriaLabel}
      triggerClassName={cx(styles.ButtonMenu, className)}
    >
      {children}
    </Popover>
  );
};

export default ButtonMenu;
