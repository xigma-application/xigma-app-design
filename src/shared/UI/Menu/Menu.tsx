import cx from 'classnames';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { FC, ReactNode } from 'react';

// components
import MenuItem from './MenuItem/MenuItem';
import MenuSeparator from './MenuSeparator/MenuSeparator';
import MenuSub from './MenuSub/MenuSub';

// styles
import styles from './menu.module.scss';

export type TMenuProps = {
  align?: 'center' | 'end' | 'start';
  children: ReactNode;
  className?: string;
  onCloseAutoFocus?: TFunc<[Event]>;
  onOpenChange?: TFunc<[boolean]>;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
  trigger: ReactNode;
  triggerAriaLabel?: string;
  triggerClassName?: string;
};

export const Menu: FC<TMenuProps> = ({
  align = 'start',
  children,
  className = '',
  onCloseAutoFocus,
  onOpenChange,
  side = 'bottom',
  sideOffset = 8,
  trigger,
  triggerAriaLabel,
  triggerClassName,
}) => (
  <DropdownMenuPrimitive.Root onOpenChange={onOpenChange}>
    <DropdownMenuPrimitive.Trigger aria-label={triggerAriaLabel} className={triggerClassName}>
      {trigger}
    </DropdownMenuPrimitive.Trigger>
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        className={cx(styles.Menu, className)}
        collisionPadding={8}
        onCloseAutoFocus={onCloseAutoFocus}
        side={side}
        sideOffset={sideOffset}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  </DropdownMenuPrimitive.Root>
);

export const MenuCompound = {
  MenuItem,
  MenuSeparator,
  MenuSub,
};

export default Menu;
